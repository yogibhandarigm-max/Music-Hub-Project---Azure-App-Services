# Swarity - Static Website

A beautiful, responsive static website for an international Indian music platform with login and sign-up functionality.

## Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Login Page**: User authentication form with validation
- **Sign-Up Page**: User registration with comprehensive form validation
- **Home Page**: Landing page with features showcase
- **Form Validation**: Client-side validation for all forms
- **Music Industry Theme**: Professional design tailored for music professionals

## File Structure

```
small website/
├── index.html          # Home/Landing page
├── login.html          # Login page
├── signup.html         # Sign-up page
├── style.css           # Main stylesheet
├── script.js           # Form validation and interactivity
├── web.config          # Azure App Service configuration
└── README.md           # This file
```

## User Roles

The sign-up form includes the following roles:
- Artist
- Producer
- Manager
- Sound Engineer
- Music Enthusiast
- Other

## Features

### Home Page
- Navigation bar with branding
- Hero section with call-to-action buttons
- Features showcase with 4 key features
- About section
- Footer with links

### Login Page
- Email and password fields
- Remember me checkbox
- Forgot password link
- Form validation
- Success message display

### Sign-Up Page
- First and last name
- Email address
- User role selection
- Strong password requirements
- Password confirmation
- Terms and conditions agreement
- Form validation with error messages

## Password Requirements

For security, passwords must contain:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

## How to Use Locally

1. Extract all files to a folder
2. Open `index.html` in your web browser
3. Navigate through the pages using the menu
4. Test the login and sign-up forms with validation

## Azure data model

This project uses Azure Table Storage for application data that is simple and schema-light, such as user accounts and authentication metadata.

- Use Azure Table Storage for user records:
  - partition key: `USER`
  - row key: user email
  - hashed password and role
- Use Azure Key Vault for secrets:
  - storage account access key
  - JWT signing secret
  - YouTube API key

## Implementation Roadmap

This project can be extended in phases to learn Azure services, networking, security, monitoring, and deployment automation. Follow the steps below in order, and repeat them manually in the Azure portal and with CLI commands.

### Prerequisites for Phase 1
- Azure subscription and a resource group (for example, `swarity-rg`).
- Node.js installed locally.
- Azure CLI installed and signed in.
- Azure Functions Core Tools installed locally.
- Visual Studio Code with the Azure Functions extension (optional but recommended).

If you have no Azure resources yet, first create the resource group and storage account before creating the Function App.

### Phase 1: Add a local Azure Functions backend
1. Create a `functions/` folder at project root.
2. Initialize the Functions project and create the functions. The CLI will generate the required files automatically:
   ```bash
   cd functions
   npm install -g azure-functions-core-tools@4
   func init . --javascript
   func new --name login --template "HTTP trigger" --authlevel anonymous
   func new --name signup --template "HTTP trigger" --authlevel anonymous
   func new --name trending --template "HTTP trigger" --authlevel anonymous
   ```
3. The commands above will create:
   - `functions/host.json`
   - `functions/local.settings.json`
   - `functions/login/function.json`
   - `functions/login/index.js`
   - `functions/signup/function.json`
   - `functions/signup/index.js`
   - `functions/trending/function.json`
   - `functions/trending/index.js`
4. Add the helper files:
   - `functions/db.js`
   - `functions/keyvault.js`
   - `functions/auth.js`
   - `functions/package.json`
   - `functions/README-functions.md`
5. Replace the generated placeholder code with the current implementation:
   - `functions/login/index.js` validates user credentials against Azure Table Storage and returns a signed JWT token.
   - `functions/signup/index.js` stores a new user record in Azure Table Storage with a SHA-256 hashed password.
   - `functions/trending/index.js` reads the YouTube API key from environment variables or Azure Key Vault and returns India music trending songs, with a static fallback if the API key is unavailable.
6. Configure local settings and environment variables:
   - `AzureWebJobsStorage=UseDevelopmentStorage=true`
   - `FUNCTIONS_WORKER_RUNTIME=node`
   - `STORAGE_ACCOUNT_NAME`
   - `STORAGE_ACCOUNT_KEY` or `STORAGE_ACCOUNT_KEY_SECRET_NAME`
   - `USER_TABLE_NAME` (default: `Users`)
   - `KEY_VAULT_NAME`
   - `JWT_SECRET_NAME` (default: `JwtSecret`)
   - `YOUTUBE_API_KEY_SECRET_NAME` (default: `YouTubeApiKey`)
7. Example `functions/local.settings.json`:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "UseDevelopmentStorage=true",
       "FUNCTIONS_WORKER_RUNTIME": "node",
       "STORAGE_ACCOUNT_NAME": "<your-storage-account-name>",
       "STORAGE_ACCOUNT_KEY": "<your-storage-account-key>",
       "USER_TABLE_NAME": "Users",
       "KEY_VAULT_NAME": "<your-key-vault-name>",
       "JWT_SECRET_NAME": "JwtSecret",
       "YOUTUBE_API_KEY_SECRET_NAME": "YouTubeApiKey"
     }
   }
   ```
8. Install dependencies:
   ```bash
   cd functions
   npm install
   ```
9. Run locally:
   ```bash
   func start
   ```
10. Test locally:
   - `http://localhost:7071/api/login`
   - `http://localhost:7071/api/signup`
   - `http://localhost:7071/api/trending`
11. Update frontend calls in `index.html` or add `config.js` with `window.API_BASE_URL`, then call:
   - `POST ${API_BASE_URL}/login`
   - `POST ${API_BASE_URL}/signup`
   - `GET ${API_BASE_URL}/trending`
12. When deployed to Azure, enable system-assigned managed identity for the Function App, grant it Key Vault `get` and `list` permission, and use Azure App Settings to reference `KEY_VAULT_NAME`, `JWT_SECRET_NAME`, `YOUTUBE_API_KEY_SECRET_NAME`, and `STORAGE_ACCOUNT_KEY_SECRET_NAME`.

Manual portal steps:
- Create a Function App in Azure Portal.
- Runtime stack: Node 18.
- Publish: Code.
- Operating System: Windows or Linux.
- Create or reuse a Storage account.
- Set `Application Insights` to Off or create later.
- Deploy from VS Code or ZIP deploy.
- Configure App Settings: `FUNCTIONS_EXTENSION_VERSION=~4`, `WEBSITE_RUN_FROM_PACKAGE=1`, and any other app settings.

### Phase 2: Deploy the frontend to App Service
1. Create `appservice-settings.json` or a deployment script.
2. Deploy the static site to App Service.
3. Enable HTTPS-only and managed identity if required.

CLI commands:
```bash
az webapp create \
  --resource-group swarity-rg \
  --plan swarity-plan \
  --name swarity-app \
  --runtime "NODE|18-lts"

zip -r swarity-frontend.zip . -x "*.git*" "*.env*"
az webapp deployment source config-zip \
  --resource-group swarity-rg \
  --name swarity-app \
  --src swarity-frontend.zip

az webapp update \
  --resource-group swarity-rg \
  --name swarity-app \
  --https-only true
```
Portal steps:
- Navigate to App Service > Create.
- Select Resource Group: `swarity-rg`.
- Create App Service Plan: `swarity-plan`.
- Runtime stack: Node 18.
- After creation, go to Deployment Center > Local Git or Zip Deploy.
- Go to TLS/SSL settings > HTTPS Only = On.

### Phase 3: Add API Management (APIM)
1. Create APIM service.
2. Import the Function App APIs.
3. Add CORS, rate limit, and authorization policies.

CLI commands:
```bash
az apim create \
  --name swarity-apim \
  --resource-group swarity-rg \
  --publisher-email admin@swarity.com \
  --publisher-name Swarity \
  --sku Developer \
  --location eastus

az apim api import \
  --resource-group swarity-rg \
  --service-name swarity-apim \
  --path swarity-api \
  --display-name "Swarity API" \
  --api-id swarity-api \
  --specification-format Swagger \
  --specification-path "https://<function-app>.azurewebsites.net/api/swagger.json"
```
Portal steps:
- Create APIM service in Azure Portal.
- Open APIM > APIs > Add API > Function App.
- Select Function App and import `login`, `signup`, `trending` APIs.
- Set CORS policy to allow your App Service domain.
- Add rate-limit policy if desired.

### Phase 4: Add Azure networking and security
1. Create `swarity-vnet` and subnets:
   - `app-subnet`
   - `func-subnet`
   - `private-subnet`
   - `AzureFirewallSubnet`
2. Create NSGs and attach them to workload subnets.
3. Create Azure Firewall + Firewall Policy.
4. Create `swarity-udr` and route to firewall private IP.
5. Create Private Endpoints for Key Vault and Storage.
6. Create Private DNS zone for internal resolution.

CLI commands:
```bash
az network vnet create \
  --resource-group swarity-rg \
  --name swarity-vnet \
  --address-prefix 10.0.0.0/16 \
  --subnet-name app-subnet \
  --subnet-prefix 10.0.1.0/24

az network vnet subnet create \
  --resource-group swarity-rg \
  --vnet-name swarity-vnet \
  --name func-subnet \
  --address-prefix 10.0.2.0/24

az network vnet subnet create \
  --resource-group swarity-rg \
  --vnet-name swarity-vnet \
  --name private-subnet \
  --address-prefix 10.0.3.0/24

az network vnet subnet create \
  --resource-group swarity-rg \
  --vnet-name swarity-vnet \
  --name AzureFirewallSubnet \
  --address-prefix 10.0.4.0/26

az network nsg create --resource-group swarity-rg --name swarity-app-nsg
az network nsg create --resource-group swarity-rg --name swarity-func-nsg

az network firewall policy create \
  --resource-group swarity-rg \
  --name swarity-fwpolicy

az network firewall create \
  --resource-group swarity-rg \
  --name swarity-firewall \
  --location eastus \
  --sku AZFW_VNet \
  --vnet-name swarity-vnet \
  --public-ip-address swarity-fw-pip \
  --firewall-policy swarity-fwpolicy
```
Portal steps:
- Create Virtual Network > `swarity-vnet`.
- Add subnets and set `AzureFirewallSubnet` purpose.
- Create NSGs and attach to `app-subnet` and `func-subnet`.
- Create Firewall Policy > add rules for HTTP/HTTPS/DNS.
- Create Azure Firewall > attach `swarity-vnet` and select policy.
- Create Route table > add route `0.0.0.0/0` to firewall private IP.
- Associate route table with `app-subnet` and `func-subnet` only.
- Create Private Endpoint for Key Vault/Storage and add Private DNS zone.

### Phase 5: Add monitoring and observability
1. Create App Insights and Log Analytics.
2. Enable Application Insights for App Service and Function App.
3. Add alerts for failures, performance, and availability.

CLI commands:
```bash
az monitor log-analytics workspace create \
  --resource-group swarity-rg \
  --workspace-name swarity-law \
  --location eastus

az monitor app-insights component create \
  --app swarity-ai \
  --location eastus \
  --resource-group swarity-rg \
  --application-type web

az webapp config appsettings set \
  --resource-group swarity-rg \
  --name swarity-app \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="<key>" \
              APPLICATIONINSIGHTS_CONNECTION_STRING="<connection-string>"

az functionapp config appsettings set \
  --resource-group swarity-rg \
  --name swarity-functions \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="<key>"
```
Portal steps:
- Create Application Insights resource.
- Open App Service > Application Insights > Enable.
- Open Function App > Application Insights > Enable.
- Create alerts in Monitor > Alerts > New alert rule.
- Use Live Metrics and Log Analytics queries to verify telemetry.

### Phase 6: Add Infrastructure as Code and DevOps
1. Create `infra/` folder.
2. Add Bicep or Terraform files:
   - `infra/main.bicep`
   - `infra/storage.bicep`
   - `infra/keyvault.bicep`
   - `infra/vnet.bicep`
   - `infra/firewall.bicep`
   - `infra/appservice.bicep`
   - `infra/functions.bicep`
   - `infra/monitoring.bicep`
   - `infra/apim.bicep`
   - `infra/private-endpoint.bicep`
   - `infra/deployment-slot.bicep`
   - `infra/apim-policy.xml`
3. Create GitHub Actions workflows:
   - `.github/workflows/ci.yml`
   - `.github/workflows/cd.yml`
4. Add deployment and test scripts:
   - `scripts/deploy-infra.ps1`
   - `scripts/deploy-infra.sh`
   - `scripts/run-tests.ps1`
   - `scripts/run-tests.sh`

CLI commands:
```bash
az deployment group create \
  --resource-group swarity-rg \
  --template-file infra/main.bicep \
  --parameters @infra/parameters.json
```

GitHub Actions example:
- Build static site
- Zip deploy App Service
- Deploy Functions package
- Deploy ARM/Bicep template
- Run smoke tests
- Validate documentation and infrastructure artifacts

### Optional Phase 7: Add container and AKS support
- Add `Dockerfile` for frontend or backend.
- Create AKS cluster and ACR.
- Deploy container image to AKS.
- Add Application Gateway or ingress controller.

Manual portal steps:
- Create ACR, build image.
- Create AKS cluster.
- Configure ingress and DNS.
- Connect to ACR from AKS.

## Principal Engineer Azure PaaS learning recommendations
To build interview-ready experience, extend this project with real-world Azure PaaS patterns, automation, and operations:
- Add Infrastructure as Code with Bicep or Terraform for App Service, Function App, APIM, Key Vault, VNet, private endpoints, and firewall.
- Build CI/CD pipelines with GitHub Actions or Azure DevOps to deploy frontend, backend, and IaC together.
- Add API security with APIM JWT validation, managed identity auth, and Azure AD OAuth/OpenID Connect.
- Implement observability with Application Insights, Log Analytics, distributed traces, and alerting for failures and latency.
- Add network isolation using VNet integration, private endpoints, Azure Firewall, NSGs, and private DNS.
- Improve resiliency with deployment slots, autoscale rules, health probes, and rollback support.
- Strengthen security by rotating secrets, using Key Vault references, and upgrading password hashing to bcrypt or Argon2.
- Add governance and cost controls with resource tagging, budgets, policies, and deployment validation.
- Create architecture documentation, tradeoff notes, and an operational runbook for the solution.
- Add test coverage with unit tests for functions and integration tests for API endpoints.

---

## YouTube Trending Sync (optional)

The home page can automatically sync the `Trending Now` section from YouTube Music using the YouTube Data API v3. The feed is configured for India-only trending music.

1. Get a YouTube Data API v3 key from Google Cloud Console.
2. Copy `config.example.js` to `config.js` and replace `YOUR_KEY_HERE` with your API key.
3. Open `index.html` in your browser — the `Trending Now` cards will populate from YouTube (music category) and each card links to the YouTube watch page for that song.

Notes:
- Do not commit `config.js` with your API key to version control.
- The sync runs client-side and requires network access to the YouTube Data API.

Automatic refresh interval
- You can configure automatic syncing every X minutes by setting `window.YOUTUBE_SYNC_INTERVAL_MINUTES` in `config.js` (example value `10`).
- Set the value to `0` to disable auto-refresh.

## Deploying to Azure App Service

### Prerequisites
- Azure subscription
- Azure CLI or Azure Portal access

### Steps to Deploy

#### Option 1: Using Azure Portal

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" and search for "App Service"
3. Click "Create"
4. Fill in the details:
   - **Resource Group**: Create new or select existing
   - **Name**: Choose a unique name (e.g., `musichupdemo`)
   - **Publish**: Select "Code"
   - **Runtime stack**: Select ".NET" (for static sites, any runtime works)
   - **Operating System**: Windows or Linux
   - **Region**: Choose your region
5. Click "Review + create" then "Create"
6. Once deployed, go to the App Service
7. Click "Deployment Center" in the left sidebar
8. Connect your GitHub repository or upload files directly
9. Upload all files from this folder

#### Option 2: Using Azure CLI

```bash
# Login to Azure
az login

# Create a resource group
az group create --name myResourceGroup --location "East US"

# Create an App Service plan
az appservice plan create --name myAppServicePlan --resource-group myResourceGroup --sku FREE

# Create a web app
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name musichupdemo

# Deploy files (from the website folder)
# Option A: Using ZIP deployment
zip -r website.zip .
az webapp deployment source config-zip --resource-group myResourceGroup --name musichupdemo --src website.zip

# Option B: Using Git
cd "your-website-folder"
git init
git add .
git commit -m "Initial commit"
git remote add azure <your-git-url-from-azure>
git push azure master
```

#### Option 3: Using Visual Studio Code

1. Install the "Azure App Service" extension in VS Code
2. Sign in to your Azure account
3. Right-click on the App Service you want to deploy to
4. Select "Deploy to Web App"
5. Select your website folder
6. Confirm the deployment

### Important Notes

- This is a **static website** - it doesn't require any backend server
- All form submissions are handled client-side for demonstration
- In production, you'll need to connect to a backend API for actual authentication
- The `web.config` file is included for proper Azure App Service hosting

## Security Considerations

For production use:
- All form data should be sent to a secure backend API
- Implement server-side validation
- Use HTTPS for all communications
- Implement proper user authentication (JWT tokens, sessions, etc.)
- Never store passwords in plaintext
- Use industry-standard password hashing (bcrypt, argon2, etc.)

## Customization

You can customize:
- Colors: Edit the gradient colors in `style.css` (currently using purple/blue)
- Logo/Branding: Edit the "🎵 Swarity" text in HTML files
- Content: Update text, features, and information in HTML files
- Styling: Modify the CSS as needed

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This website is provided as-is for testing and educational purposes.

## Support

For issues or questions about deploying to Azure, refer to:
- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Azure Learning Path](https://learn.microsoft.com/training/paths/deploy-app-to-azure-app-service/)
# Music-Hub-Project---Azure-App-Services

