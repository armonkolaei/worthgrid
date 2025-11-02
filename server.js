const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from current directory
app.use(express.static('./'));

// Handle token exchange for both live and practice environments
app.post('/proxy/:env/oauth2/token', async (req, res) => {
  try {
    const env = req.params.env;
    const baseUrl = env === 'practice' 
      ? 'https://practicelogin.questrade.com' 
      : 'https://login.questrade.com';
    
    const response = await fetch(`${baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        grant_type: req.body.grant_type,
        refresh_token: req.body.refresh_token
      })
    });

    const data = await response.text();
    res.status(response.status);
    res.set('Content-Type', 'application/json');
    res.send(data);
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Proxy arbitrary API requests to the dynamic api_server returned by Questrade
app.post('/proxy/fetch', async (req, res) => {
  try {
    const { apiServer, path, method = 'GET', accessToken, body } = req.body;
    if (!apiServer || !path) return res.status(400).json({ error: 'apiServer and path are required' });

    const base = apiServer.replace(/\/$/, '');
    const url = `${base}/v1/${path}`;

    const headers = { Accept: 'application/json' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

    const fetchOpts = { method, headers };
    if (body) {
      // allow either object or string bodies
      if (typeof body === 'object') {
        fetchOpts.body = JSON.stringify(body);
        fetchOpts.headers['Content-Type'] = 'application/json';
      } else {
        fetchOpts.body = body;
      }
    }

    const response = await fetch(url, fetchOpts);
    const text = await response.text();
    // mirror status and body
    res.status(response.status);
    // try to set JSON content type when possible
    res.set('Content-Type', 'application/json');
    res.send(text);
  } catch (error) {
    console.error('Proxy fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});