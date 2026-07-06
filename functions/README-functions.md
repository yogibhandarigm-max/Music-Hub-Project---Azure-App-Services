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
2. Install dependencies:
   ```bash
   cd functions
   npm install
   ```
3. Start the Functions app:
   ```bash
   func start
   ```
4. Test the endpoints:
   - `http://localhost:7071/api/login`
   - `http://localhost:7071/api/signup`
   - `http://localhost:7071/api/trending`

## Azure integration

This backend uses Azure Table Storage for user data and authentication metadata, and Azure Key Vault for secret management.

- Azure Table Storage stores user records such as email, name, role, and bcrypt password hash.
- Azure Key Vault stores sensitive secrets such as the storage account key, JWT secret, and YouTube API key.

Required local settings or environment variables:
- `STORAGE_ACCOUNT_NAME`
- `STORAGE_ACCOUNT_KEY` or `STORAGE_ACCOUNT_KEY_SECRET_NAME`
- `USER_TABLE_NAME` (default: `Users`)
- `KEY_VAULT_NAME`
- `YOUTUBE_API_KEY_SECRET_NAME` (default: `YouTubeApiKey`)
- `JWT_SECRET_NAME` (default: `JwtSecret`)

When deployed to Azure, store the storage account key and YouTube API key in Key Vault, then configure the Function App to use managed identity and access those secrets.
