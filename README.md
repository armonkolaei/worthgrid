# Worth Grid

**A self-hostable alternative to Walthica for tracking your net worth.**

Worth Grid brings your assets, liabilities, and connected brokerage accounts into one personal dashboard. Track changes over time, organize accounts into groups, and keep a copy of your portfolio data with CSV export.

> Worth Grid is an independent project and is not affiliated with Walthica or Questrade.

[OpenAltMarket.com](https://openaltmarket.com) — explore options to open, deploy, and customize Worth Grid.

## What it does

- Shows net worth, total assets, and liabilities in one dashboard.
- Charts a six-month net-worth history and shows six-month account changes and returns.
- Lets you add and edit manual accounts, transactions, cash, investments, real estate, and liabilities.
- Organizes accounts into custom groups.
- Connects Questrade with a read-only API token, imports balances and positions, and supports manual or daily sync.
- Exports the account summary as CSV.
- Provides email-and-password accounts, protected API routes, and encrypted storage for broker tokens.

Questrade is the only live institution integration currently included. Other connection tiles shown in the interface are marked as coming soon.

## Technology

- React 18 and Vite
- Node.js 20+
- Express API
- MongoDB (or a compatible MongoDB service)
- Vercel serverless deployment, with a daily scheduled sync

## Run locally

### Requirements

- Node.js 20 or newer and npm
- A MongoDB database and connection URI

### Setup

1. Clone the repository and enter the project directory:

   ```sh
   git clone https://github.com/armonkolaei/worthgrid.git
   cd worthgrid
   ```

2. Create your local environment file:

   ```sh
   cp .env.example .env
   ```

   In Windows PowerShell, use `Copy-Item .env.example .env` instead.

3. Fill in the values in `.env`. Generate each secret locally with Node.js and paste the output into the corresponding variable:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
   ```

   These commands generate values for `JWT_SECRET`, `ENCRYPTION_KEY`, and `CRON_SECRET`, respectively. Keep the output private and do not commit `.env`.

4. Install dependencies and check the database connection:

   ```sh
   npm install
   npm run db:init
   ```

5. Start the local frontend and API:

   ```sh
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173). The Vite frontend runs on port `5173`; the local API runs on port `3001`.

6. Create an account in the app, then add accounts manually or connect Questrade.

## Environment variables

All five variables used by the local `.env` are included in [`.env.example`](./.env.example). Keep these values server-side: do not rename them with a `VITE_` prefix, publish them in client-side code, or commit your `.env` file.

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection URI for the application database. |
| `MONGODB_DB` | No | Database name. Defaults to `worthgrid-db`. |
| `JWT_SECRET` | Yes | Private signing secret for login sessions; must be at least 32 characters. |
| `ENCRYPTION_KEY` | Yes | Base64-encoded 32-byte key used to encrypt saved brokerage credentials. Generate it with the second command above. Keep it safe and stable: changing or losing it makes existing saved connections unreadable, so users will need to reconnect. |
| `CRON_SECRET` | For scheduled sync | Secret used to protect `/api/cron/sync`. Vercel Cron calls this endpoint for the daily sync. |

Use your own generated secrets in every environment. Do not copy secret values from another installation or check them into source control.

## Deploy to Vercel

Vercel is the deployment target configured in this repository.

1. Create a MongoDB database and a database user with access to it. Copy the provider's connection URI and ensure the deployed application can reach the database.
2. In Vercel, import the GitHub repository [`armonkolaei/worthgrid`](https://github.com/armonkolaei/worthgrid).
3. Configure the project with the repository root as its root directory. The checked-in `vercel.json` supplies the build command (`npm run build`), output directory (`dist`), API function, rewrites, and daily sync schedule.
4. In the Vercel project's **Settings → Environment Variables**, add:
   - `MONGODB_URI`
   - `MONGODB_DB` (optional; defaults to `worthgrid-db`)
   - `JWT_SECRET`
   - `ENCRYPTION_KEY`
   - `CRON_SECRET`

   Generate fresh secret values using the commands in [Run locally](#run-locally). Add them to the production environment (and preview/development environments if you use those), not to the repository.
5. Deploy. Visit the deployed site, create an account, and verify that it can read and write to MongoDB.
6. Optionally connect Questrade using a read-only token. Confirm that the deployment's scheduled daily sync is enabled in the Vercel project.

Vercel sets `NODE_ENV` for production deployments. The app uses it to set secure session cookies.

## Deploy to Kubeify or another Node host

This repository currently includes Vercel deployment configuration, but not a standalone production server command for a general-purpose Node/container host. `npm run dev` is for local development and should not be used as a production start command.

For a Kubeify deployment, first confirm that the platform can run a Node.js 20+ service and serve the Vite build while routing `/api/*` requests to the Express API. That production server/adapter is not included yet. The same environment variables above will be needed; scheduled syncing also requires the host's scheduler to call `/api/cron/sync` with the configured `CRON_SECRET`.

## Connecting Questrade

1. In Questrade, open the API Centre and register a personal app.
2. Enable only read-only permissions for account balances and positions. Do not enable trading.
3. Generate a token, then in Worth Grid choose **Add → Banks & Brokerages** and follow the connection steps.
4. Use **Sync** to refresh manually. Vercel deployments also schedule a daily refresh.

## Security notes

- Broker credentials are encrypted at rest using AES-256-GCM and `ENCRYPTION_KEY`.
- Passwords are hashed before storage; session cookies are HTTP-only and secure in production.
- Keep database credentials and all server secrets private. Rotate credentials if they are exposed.
- The Questrade connection is read-only; never grant trading permissions to the app.

## Customization

Worth Grid is built to be adapted. See [OpenAltMarket.com](https://openaltmarket.com) for ways to open, deploy, and customize the application.
