# Worthgrid

A Questrade Portfolio Viewer with CORS proxy server for handling OAuth token exchanges.

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- A Questrade API key (from either Practice or Live environment)

## Local Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/armonkolaei/worthgrid.git
cd worthgrid
```

2. Install dependencies:
```bash
npm install
```

3. Start the local server:
```bash
npm start
```

The server will start running at `http://localhost:8080`

## Getting a Questrade API Key

1. Go to the Questrade Developer portal:
   - Practice Environment: https://app.questrade.com/api/developer/practice
   - Live Environment: https://app.questrade.com/api/developer/live

2. Log in with your Questrade account
3. Click on "Register an Application"
4. Fill in the application details:
   - Name: WorthGrid (or your preferred name)
   - Description: Portfolio viewer application
   - URI: http://localhost:8080
5. Save the application
6. Generate a new API key and save it securely - you'll need this to connect to the application

## Connecting with Your API Key

1. Open the application in your browser at `http://localhost:8080`
2. Choose your environment (Practice or Live)
3. Enter your API key when prompted
4. The application will handle the OAuth token exchange and refresh process automatically

## Security Notes

- Never share your API key
- The server includes CORS protection
- API keys should be regenerated periodically for security
- Keys from the practice environment cannot be used in the live environment and vice versa

## Development

The project consists of:
- `server.js`: Express server handling OAuth token exchange
- `index.html`: Frontend interface
- API proxy for Questrade interactions

## Troubleshooting

If you encounter connection issues:
1. Verify the server is running at port 8080
2. Ensure you're using the correct environment's API key
3. Check the browser console for any error messages
4. Verify your API key hasn't expired

## License

MIT License

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request