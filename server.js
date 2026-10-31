const express = require('express');
const path = require('path');
const fetch = require('node-fetch');

const app = express();

// Local-only tool: bind to loopback and never expose publicly.
const HOST = '127.0.0.1';
const PORT = 8080;

const LOGIN_HOSTS = {
  live: 'https://login.questrade.com',
  login: 'https://login.questrade.com',
  practice: 'https://practicelogin.questrade.com'
};

// Questrade api_server values look like https://api01.iq.questrade.com/
const API_HOST_RE = /^api\d+\.iq\.questrade\.com$/i;
const API_PATH_RE = /^[A-Za-z0-9_\-\/.=?&,%]+$/;

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

// Reject cross-origin browser requests; only the page served by this server may call the proxy.
app.use('/proxy', (req, res, next) => {
  const origin = req.get('Origin');
  if (origin && origin !== `http://localhost:${PORT}` && origin !== `http://${HOST}:${PORT}`) {
    return res.status(403).json({ error: 'Forbidden origin' });
  }
  next();
});

app.use((req, res, next) => {
  res.set({
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store'
  });
  next();
});

// Only the public folder is served.
app.use(express.static(path.join(__dirname, 'public'), { dotfiles: 'ignore' }));

app.post('/proxy/:env/oauth2/token', async (req, res) => {
  try {
    const baseUrl = LOGIN_HOSTS[req.params.env];
    if (!baseUrl) return res.status(400).json({ error: 'Invalid environment' });

    const { grant_type, refresh_token } = req.body || {};
    if (grant_type !== 'refresh_token' || typeof refresh_token !== 'string' || !refresh_token) {
      return res.status(400).json({ error: 'Invalid token request' });
    }

    const response = await fetch(`${baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({ grant_type, refresh_token }),
      redirect: 'error'
    });

    const data = await response.text();
    res.status(response.status).type('application/json').send(data);
  } catch (error) {
    console.error('Token exchange error');
    res.status(502).json({ error: 'Token exchange failed' });
  }
});

// Read-only proxy to the Questrade api_server, restricted to Questrade hosts.
app.post('/proxy/fetch', async (req, res) => {
  try {
    const { apiServer, path: apiPath, accessToken } = req.body || {};
    if (typeof apiServer !== 'string' || typeof apiPath !== 'string' || typeof accessToken !== 'string') {
      return res.status(400).json({ error: 'apiServer, path and accessToken are required' });
    }

    let base;
    try {
      base = new URL(apiServer);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid apiServer' });
    }
    if (base.protocol !== 'https:' || base.port || !API_HOST_RE.test(base.hostname)) {
      return res.status(400).json({ error: 'apiServer not allowed' });
    }
    if (!API_PATH_RE.test(apiPath) || apiPath.includes('..') || apiPath.startsWith('/')) {
      return res.status(400).json({ error: 'Invalid path' });
    }

    const response = await fetch(`https://${base.hostname}/v1/${apiPath}`, {
      method: 'GET',
      headers: { Accept: 'application/json', Authorization: 'Bearer ' + accessToken },
      redirect: 'error'
    });

    const text = await response.text();
    res.status(response.status).type('application/json').send(text);
  } catch (error) {
    console.error('Proxy fetch error');
    res.status(502).json({ error: 'Upstream request failed' });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
