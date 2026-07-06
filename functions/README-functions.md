# Azure Functions Backend for Swarity

This folder contains an Azure Functions backend for the Swarity project.

## Files

- `host.json` - Function app host configuration
- `local.settings.json` - Local settings for development
- `login/function.json` - HTTP trigger binding for the login function
- `login/index.js` - Login function logic
- `signup/function.json` - HTTP trigger binding for the signup function
- `signup/index.js` - Signup function logic
- `trending/function.json` - HTTP trigger binding for the trending function
- `trending/index.js` - Trending function logic

## Local development

1. Install Azure Functions Core Tools:
   ```bash
   npm install -g azure-functions-core-tools@4
   ```
2. Start the Functions app:
   ```bash
   cd functions
   func start
   ```
3. Test the endpoints:
   - `http://localhost:7071/api/login`
   - `http://localhost:7071/api/signup`
   - `http://localhost:7071/api/trending`
