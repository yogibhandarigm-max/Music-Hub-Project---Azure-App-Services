# Swarity - Azure Implementation Guide for This Project

## Purpose

This project is a static music landing page with HTML, CSS, and JavaScript. For a production-grade Azure deployment, the recommended setup is:

- Azure App Service for the frontend website
- Azure Functions for optional backend logic or API endpoints
- Azure API Management (APIM) for API gateway, throttling, and security
- Managed Identity for secure service-to-service access
- Azure Key Vault for secrets and certificates
- Deployment slots for safer releases
- Application Insights and Azure Monitor for observability
- VNet integration, NSG, UDR, private endpoints, and private DNS for network isolation
- TLS/SSL settings, certificate validation, and SNI binding for secure traffic

---

## Recommended Azure Architecture

- Frontend: App Service (Linux or Windows)
- Optional backend: Azure Functions
- Security gateway: APIM
- Secrets: Key Vault
- Identity: Managed Identity
- Monitoring: Application Insights + Azure Monitor + Log Analytics
- Network: VNet with subnets, NSG, UDR, Azure Firewall, private endpoints, private DNS zone links
- Availability: staging deployment slot + autoscaling

```text
Internet
  │
  ▼
Azure Front Door / WAF
  │
  ▼
APIM
  │
  ├─ App Service (frontend)
  ├─ Azure Functions (optional backend)
  └─ Key Vault / Managed Identity / App Insights

App Service is connected to VNet and uses private endpoints for sensitive services.
```

---

## Prerequisites

- Azure subscription
- Azure CLI installed and signed in
- Node.js installed locally
- Azure Functions Core Tools installed locally
- Basic knowledge of App Service, Function App, and VNet concepts
- Access to the Azure Portal and a browser

```bash
az login
az account set --subscription "<your-subscription-id>"
az --version
```

---

## 1. Create the Core Resource Group

### Azure Portal GUI Steps
1. Open the Azure portal.
2. Go to Resource groups.
3. Click Create.
4. Enter name: swarity-rg.
5. Select a region such as East US.
6. Click Review + create, then Create.

```bash
az group create --name swarity-rg --location eastus
```

---

## 2. Create a VNet and Required Subnets

### Azure Portal GUI Steps
1. In the portal, search for Virtual networks.
2. Click Create.
3. Choose the resource group swarity-rg.
4. Name the VNet swarity-vnet.
5. Set the address space to 10.0.0.0/16.
6. Add subnets:
   - app-subnet: 10.0.1.0/24
   - func-subnet: 10.0.2.0/24
   - private-subnet: 10.0.3.0/24
7. Click Review + create.

This project should use a private network for production readiness.

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
```

---

## Implementation Checklist

If you have no resources in Azure yet, start with the steps above to create your resource group and core network.

Follow these implementation phases in order. Each phase includes portal steps and CLI commands so you can practice both approaches.

### Phase 1: Build the Azure Functions backend
1. Create a `functions/` folder in the project if it does not already exist.
2. Use Azure Functions Core Tools to initialize and scaffold the function app:
   ```bash
   cd functions
   npm install -g azure-functions-core-tools@4
   func init . --javascript
   func new --name login --template "HTTP trigger" --authlevel anonymous
   func new --name signup --template "HTTP trigger" --authlevel anonymous
   func new --name trending --template "HTTP trigger" --authlevel anonymous
   ```
3. The tools generate these files:
   - `functions/host.json`
   - `functions/local.settings.json`
   - `functions/login/function.json`
   - `functions/login/index.js`
   - `functions/signup/function.json`
   - `functions/signup/index.js`
   - `functions/trending/function.json`
   - `functions/trending/index.js`
4. Add helper files for backend integration:
   - `functions/db.js`
   - `functions/keyvault.js`
   - `functions/auth.js`
   - `functions/package.json`
   - `functions/README-functions.md`
5. Replace the generated placeholder code with the current implementation:
   - `login` validates credentials against Azure Table Storage and returns a signed JWT token using `functions/auth.js`.
   - `signup` stores a new user record in Azure Table Storage with a SHA-256 hashed password.
   - `trending` reads the YouTube API key from environment variables or Azure Key Vault and returns India trending songs from the YouTube Data API, with a fallback static playlist if the key is unavailable.
6. Configure local settings and environment variables:
   - `AzureWebJobsStorage=UseDevelopmentStorage=true`
   - `FUNCTIONS_WORKER_RUNTIME=node`
   - `STORAGE_ACCOUNT_NAME`
   - `STORAGE_ACCOUNT_KEY` or `STORAGE_ACCOUNT_KEY_SECRET_NAME`
   - `USER_TABLE_NAME` (default: `Users`)
   - `KEY_VAULT_NAME`
   - `JWT_SECRET_NAME` (default: `JwtSecret`)
   - `YOUTUBE_API_KEY_SECRET_NAME` (default: `YouTubeApiKey`)
7. Install dependencies:
   ```bash
   cd functions
   npm install
   ```
8. Run locally:
   ```bash
   func start
   ```
9. Test locally:
   - `http://localhost:7071/api/login`
   - `http://localhost:7071/api/signup`
   - `http://localhost:7071/api/trending`

Portal steps:
- Azure Portal > Create a resource > Function App.
- Runtime stack: Node 18.
- Publish: Code.
- Create or reuse a Storage account.
- Create or reuse a Key Vault.
- Enable system-assigned managed identity for the Function App.
- Grant the Function App managed identity access to get/list secrets in Key Vault.
- Configure App Settings: `KEY_VAULT_NAME`, `JWT_SECRET_NAME`, `YOUTUBE_API_KEY_SECRET_NAME`, and `STORAGE_ACCOUNT_KEY_SECRET_NAME` if applicable.
- Use APIM to front the Function App and apply CORS and JWT validation policies.

### Phase 2: Deploy the frontend to App Service
1. Create App Service plan and web app.
2. Zip deploy the static site.
3. Enable HTTPS-only.

CLI commands:
```bash
az appservice plan create \
  --name swarity-plan \
  --resource-group swarity-rg \
  --sku B1 \
  --is-linux

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
- App Service > Create > select `swarity-rg`.
- Choose a unique app name.
- Use Node 18 runtime.
- Deployment Center > Zip Deploy.
- TLS/SSL settings > HTTPS Only.

### Phase 3: Add API Management and Key Vault integration
1. Create an Azure Key Vault and add secrets:
   - `JwtSecret`
   - `YouTubeApiKey`
   - `StorageAccountKey` (optional)
2. Enable system-assigned managed identity for the Function App.
3. Grant the Function App access to Key Vault secrets.
4. Create Azure API Management.
5. Import the Function App APIs into APIM.
6. Apply APIM policies for CORS, JWT validation, and rate limiting.

CLI commands:
```bash
az keyvault create \
  --resource-group swarity-rg \
  --name swarity-kv \
  --location eastus

az keyvault secret set \
  --vault-name swarity-kv \
  --name JwtSecret \
  --value "<jwt-secret>"

az keyvault secret set \
  --vault-name swarity-kv \
  --name YouTubeApiKey \
  --value "<youtube-api-key>"

az keyvault secret set \
  --vault-name swarity-kv \
  --name StorageAccountKey \
  --value "<storage-account-key>"

az functionapp identity assign \
  --name swarity-functions \
  --resource-group swarity-rg

FUNCTION_PRINCIPAL_ID=$(az functionapp identity show \
  --name swarity-functions \
  --resource-group swarity-rg \
  --query principalId -o tsv)

az keyvault set-policy \
  --name swarity-kv \
  --object-id $FUNCTION_PRINCIPAL_ID \
  --secret-permissions get list

az apim create \
  --name swarity-apim \
  --resource-group swarity-rg \
  --publisher-email admin@swarity.com \
  --publisher-name Swarity \
  --sku Developer \
  --location eastus
```

Portal steps:
- Key Vault > Create > add secrets for `JwtSecret`, `YouTubeApiKey`, and optionally `StorageAccountKey`.
- Function App > Identity > enable system-assigned managed identity.
- Key Vault > Access policies > assign the Function App principal permission to Get and List secrets.
- Function App > Configuration > add `KEY_VAULT_NAME`, `JWT_SECRET_NAME`, `YOUTUBE_API_KEY_SECRET_NAME`, and `STORAGE_ACCOUNT_KEY_SECRET_NAME` if needed.
- APIM > Create.
- APIM > APIs > Add API > Function App.
- APIM > Add CORS policy for App Service origin.
- APIM > Add JWT validation policy and optional rate limiting.

### Phase 4: Add networking and security
1. Create VNet and subnets:
   - `app-subnet`
   - `func-subnet`
   - `private-subnet`
   - `AzureFirewallSubnet`
2. Create NSGs and attach them to workload subnets.
3. Create Azure Firewall and Firewall Policy.
4. Create UDR and route to the firewall private IP.
5. Create Private Endpoints and Private DNS.

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
- VNet > Create or edit > add subnets.
- Add a subnet named `AzureFirewallSubnet` with purpose `Azure Firewall`.
- Create NSGs and attach to `app-subnet` and `func-subnet`.
- Firewall Policy > create rules for HTTP/HTTPS/DNS.
- Firewall > create and associate with VNet and Firewall Policy.
- Route table > create and add route to firewall private IP.
- Associate route table to workload subnets only.
- Private endpoint > create for Key Vault/Storage.
- Private DNS zone > add zone and virtual network link.

### Phase 2: Deploy the frontend to App Service
1. Create App Service plan and web app.
2. Zip deploy the site.
3. Enable HTTPS-only.

CLI commands:
```bash
az appservice plan create \
  --name swarity-plan \
  --resource-group swarity-rg \
  --sku B1 \
  --is-linux

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
- App Service > Create > select `swarity-rg`.
- Choose a unique app name.
- Use Node 18 runtime.
- Deployment Center > Zip Deploy.
- TLS/SSL settings > HTTPS Only.

### Phase 3: Add API Management
1. Create an APIM instance.
2. Import your Function App APIs.
3. Configure policies and CORS.

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
  --specification-format OpenApi \
  --specification-path "https://<function-app>.azurewebsites.net/api/swagger.json"
```

Portal steps:
- APIM > Create.
- APIs > Add API > Function App.
- Select your Function App and import APIs.
- Add CORS policy to allow App Service origin.
- Add throttling or JWT validation policy.

### Phase 4: Add networking and security
1. Create VNet and subnets:
   - `app-subnet`
   - `func-subnet`
   - `private-subnet`
   - `AzureFirewallSubnet`
2. Create NSGs and attach them to workload subnets.
3. Create Azure Firewall and Firewall Policy.
4. Create UDR and route to the firewall private IP.
5. Create Private Endpoints and Private DNS.

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
- VNet > Create or edit > add subnets.
- Add a subnet named `AzureFirewallSubnet` with purpose `Azure Firewall`.
- Create NSGs and attach to `app-subnet` and `func-subnet`.
- Firewall Policy > create rules for HTTP/HTTPS/DNS.
- Firewall > create and associate with VNet and Firewall Policy.
- Route table > create and add route to firewall private IP.
- Associate route table to workload subnets only.
- Private endpoint > create for Key Vault/Storage.
- Private DNS zone > add zone and virtual network link.

### Phase 5: Add monitoring and observability
1. Create Application Insights and Log Analytics.
2. Enable App Insights on App Service and Function App.
3. Create alerts and dashboards.

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
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="<key>"

az functionapp config appsettings set \
  --resource-group swarity-rg \
  --name swarity-functions \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY="<key>"
```

Portal steps:
- Create Application Insights resource.
- App Service > Settings > Application Insights > Enable.
- Function App > Settings > Application Insights > Enable.
- Monitor > Alerts > New alert rule.
- Verify with Live Metrics and Log Analytics queries.

### Phase 6: Add IaC and DevOps automation
1. Create `infra/` folder.
2. Add Bicep or Terraform definitions for all resources.
3. Add GitHub Actions workflows for CI/CD.
4. Add deployment scripts.

CLI commands:
```bash
az deployment group create \
  --resource-group swarity-rg \
  --template-file infra/main.bicep \
  --parameters @infra/parameters.json
```

Pipeline steps:
- Checkout code.
- Build and lint frontend.
- Deploy static site to App Service.
- Deploy functions to Function App.
- Deploy infrastructure template.
- Run end-to-end smoke tests.

### Optional Phase 7: Add AKS and container support
- Build a `Dockerfile` for frontend or backend.
- Push image to ACR.
- Create AKS cluster.
- Deploy containers and ingress.
- Add Azure Application Gateway or WAF.

Portal steps:
- Create ACR.
- Build and push container image.
- Create AKS cluster.
- Configure ingress and DNS.

### Network Security Group (NSG)

### Azure Portal GUI Steps
1. Search for Network security groups in the portal.
2. Click Create.
3. Name it swarity-nsg.
4. Choose the same resource group.
5. Click Review + create.
6. After creation, go to Inbound security rules and add rules for HTTPS/HTTP as needed.

```bash
az network nsg create \
  --resource-group swarity-rg \
  --name swarity-nsg
```

### Route Table (UDR) and Azure Firewall

### Important Deployment Order
Create the Azure Firewall before creating the final user-defined route that points traffic to the firewall.

The correct sequence is:

1. Create or confirm the VNet address space.
2. Create the required `AzureFirewallSubnet`.
3. Optionally create `AzureFirewallManagementSubnet` only if using Firewall Management NIC or forced tunneling.
4. Create the Azure Firewall Policy.
5. Create the Azure Firewall and associate it with the VNet and Firewall Policy.
6. After the firewall is deployed, copy the firewall private IP address.
7. Create or update the route table.
8. Add a route where the next hop is the Azure Firewall private IP.
9. Associate the route table with workload subnets such as `app-subnet` and `func-subnet`.
10. Create firewall policy rules to allow required outbound traffic.

Do not associate the route table to `AzureFirewallSubnet`.

---

### Create the AzureFirewallSubnet

### Azure Portal GUI Steps
1. In the portal, open the existing virtual network.
2. Click Subnets.
3. Click Add subnet.
4. In the Add subnet form, set Subnet purpose to `Azure Firewall`.
5. Set the Name to `AzureFirewallSubnet`.
6. Use a /26 or larger prefix, for example `10.0.4.0/26`.
7. Click Save.

```bash
az network vnet subnet create \
  --resource-group swarity-rg \
  --vnet-name swarity-vnet \
  --name AzureFirewallSubnet \
  --address-prefix 10.0.4.0/26
```

### (Optional) Create AzureFirewallManagementSubnet

Only required for firewall management NICs or forced tunneling scenarios.

```bash
az network vnet subnet create \
  --resource-group swarity-rg \
  --vnet-name swarity-vnet \
  --name AzureFirewallManagementSubnet \
  --address-prefix 10.0.5.0/26
```

### Create the Route Table

### Azure Portal GUI Steps
1. Search for Route tables.
2. Click Create.
3. Name it swarity-udr.
4. Select the resource group.
5. Click Review + create.

```bash
az network route-table create \
  --resource-group swarity-rg \
  --name swarity-udr
```

### Create a Firewall Policy

### Azure Portal GUI Steps
1. Search for Firewall policies.
2. Click Create.
3. Name it swarity-fwpolicy.
4. Select the resource group and region.
5. Add rules to allow required outbound traffic (HTTP, HTTPS, DNS, etc.).
6. Review + create.

```bash
az network firewall policy create \
  --resource-group swarity-rg \
  --name swarity-fwpolicy
```

### Create the Azure Firewall

### Azure Portal GUI Steps
1. Search for Azure Firewall.
2. Click Create.
3. Choose the resource group and region.
4. Create or use a public IP for the firewall.
5. Associate the firewall with the VNet.
6. Select the Firewall Policy.
7. Click Review + create.

```bash
az network firewall create \
  --resource-group swarity-rg \
  --name swarity-firewall \
  --location eastus \
  --sku AZFW_VNet \
  --vnet-name swarity-vnet \
  --public-ip-address swarity-fw-pip \
  --firewall-policy swarity-fwpolicy
```

### Add a Route to the Firewall

After the firewall is deployed, get its private IP address and configure the route table.

```bash
FIREWALL_PRIVATE_IP=$(az network firewall show \
  --resource-group swarity-rg \
  --name swarity-firewall \
  --query "ipConfigurations[0].privateIpAddress" -o tsv)

az network route-table route create \
  --resource-group swarity-rg \
  --route-table-name swarity-udr \
  --name RouteToFirewall \
  --address-prefix 0.0.0.0/0 \
  --next-hop-type VirtualAppliance \
  --next-hop-ip-address $FIREWALL_PRIVATE_IP
```

### Associate the Route Table with Workload Subnets

Associate `swarty-udr` with `app-subnet` and `func-subnet`, but not with `AzureFirewallSubnet`.

```bash
az network vnet subnet update \
  --resource-group swarity-rg \
  --vnet-name swarity-vnet \
  --name app-subnet \
  --route-table swarity-udr

az network vnet subnet update \
  --resource-group swarity-rg \
  --vnet-name swarity-vnet \
  --name func-subnet \
  --route-table swarity-udr
```

### Firewall Policy Rules

Create explicit rules for any required outbound traffic to support the app, such as:

- HTTP/HTTPS to external services
- DNS to the chosen DNS resolver
- Access to Azure service endpoints if needed

This prevents the firewall from blocking legitimate application outbound traffic.

---

## 4. Create App Service Plan and Web App

### Azure Portal GUI Steps
1. In the portal, search for App Services.
2. Click Create.
3. Choose the resource group swarity-rg.
4. Enter a unique app name such as swarity-app.
5. Select a paid plan such as P1v2.
6. Choose Node.js 18 LTS runtime.
7. Click Review + create.

Use a paid App Service plan for production features such as deployment slots, autoscaling, VNet integration, and health checks.

```bash
az appservice plan create \
  --name swarity-plan \
  --resource-group swarity-rg \
  --sku P1v2 \
  --is-linux

az webapp create \
  --resource-group swarity-rg \
  --plan swarity-plan \
  --name swarity-app \
  --runtime "NODE|18-lts"
```

### Enable HTTPS Only

```bash
az webapp update --resource-group swarity-rg --name swarity-app --https-only true
```

### Enable VNet Integration

### Azure Portal GUI Steps
1. Open the App Service.
2. Go to Networking.
3. Under VNet integration, click Add VNet.
4. Select swarity-vnet and app-subnet.
5. Save the change.

```bash
az webapp vnet-integration add \
  --resource-group swarity-rg \
  --name swarity-app \
  --vnet swarity-vnet \
  --subnet app-subnet
```

### Health Check for App Service

### Azure Portal GUI Steps
1. Open the App Service.
2. Go to Health check.
3. Turn it on.
4. Set the path to /health or /health.html.
5. Save and restart the app if needed.

For this project, add a simple health endpoint such as `/health` or `/health.html`.

```bash
az webapp config set \
  --resource-group swarity-rg \
  --name swarity-app \
  --generic-configurations '{"healthCheckPath":"/health"}'
```

---

## 5. Add Managed Identity and Key Vault

### Azure Portal GUI Steps
1. Search for Managed Identities.
2. Click Create.
3. Name it swarity-identity.
4. Select the resource group and region.
5. Click Review + create.

### Create Managed Identity

```bash
az identity create \
  --resource-group swarity-rg \
  --name swarity-identity
```

### Create Key Vault

### Azure Portal GUI Steps
1. Search for Key Vaults.
2. Click Create.
3. Choose the resource group.
4. Enter a unique name such as swarity-kv-<unique>.
5. Select Standard SKU.
6. Click Review + create.

```bash
az keyvault create \
  --resource-group swarity-rg \
  --name swarity-kv-<unique> \
  --location eastus \
  --sku standard
```

### Assign Identity to Key Vault

### Azure Portal GUI Steps
1. Open the Key Vault.
2. Go to Access policies.
3. Add a new access policy.
4. Select the managed identity.
5. Grant Get/List permissions to secrets, keys, and certificates.

```bash
az keyvault set-policy \
  --name swarity-kv-<unique> \
  --object-id <managed-identity-principal-id> \
  --secret-permissions get list \
  --key-permissions get list \
  --certificate-permissions get list
```

### Store App Settings in Key Vault

Use Key Vault references in App Service app settings where possible.

```bash
az webapp config appsettings set \
  --resource-group swarity-rg \
  --name swarity-app \
  --settings "KEY_VAULT_URI=https://swarity-kv-<unique>.vault.azure.net/"
```

---

## 6. Create Azure Functions (Optional Backend)

### Azure Portal GUI Steps
1. Search for Function App.
2. Click Create.
3. Choose the same resource group and plan.
4. Enter a unique function app name.
5. Select Node.js 18 LTS.
6. Click Review + create.

If you later add an API for login, playlists, or user data, deploy Azure Functions.

```bash
az functionapp create \
  --resource-group swarity-rg \
  --plan swarity-plan \
  --name swarity-func \
  --runtime node --runtime-version 18 \
  --functions-version 4
```

Assign the same managed identity and connect the function app to the VNet.

```bash
az webapp vnet-integration add \
  --resource-group swarity-rg \
  --name swarity-func \
  --vnet swarity-vnet \
  --subnet func-subnet
```

---

## 7. Configure Deployment Slots

### Azure Portal GUI Steps
1. Open the App Service.
2. Go to Deployment slots.
3. Click Add slot.
4. Name the slot staging.
5. Create it and deploy to it first.

Deployment slots allow safer release testing.

```bash
az webapp deployment slot create \
  --resource-group swarity-rg \
  --name swarity-app \
  --slot staging
```

Deploy to staging first, test, then swap:

```bash
az webapp deployment slot swap \
  --resource-group swarity-rg \
  --name swarity-app \
  --slot staging
```

---

## 8. Enable Autoscaling

### Azure Portal GUI Steps
1. Open the App Service plan.
2. Go to Scale out (App Service plan).
3. Enable autoscale.
4. Add a rule for CPU usage greater than 70%.
5. Save the profile.

```bash
az monitor autoscale create \
  --resource-group swarity-rg \
  --resource swarity-plan \
  --resource-type Microsoft.Web/serverfarms \
  --name swarity-autoscale \
  --min-count 2 \
  --max-count 5 \
  --count 2
```

Recommended rule: scale up when CPU is above 70% for 5 minutes.

---

## 9. Add Application Insights and Azure Monitor

### Azure Portal GUI Steps
1. Search for Application Insights.
2. Click Create.
3. Choose the resource group.
4. Name the resource swarity-ai.
5. Select the same region.
6. Click Review + create.

```bash
az monitor app-insights component create \
  --app swarity-ai \
  --location eastus \
  --resource-group swarity-rg \
  --kind web
```

Link the app to Application Insights:

```bash
az webapp config appsettings set \
  --resource-group swarity-rg \
  --name swarity-app \
  --settings \
  APPLICATIONINSIGHTS_CONNECTION_STRING="<connection-string>" \
  ApplicationInsightsAgent_EXTENSION_VERSION="~3"
```

Enable diagnostics logs to Log Analytics.

```bash
az monitor log-analytics workspace create \
  --resource-group swarity-rg \
  --workspace-name swarity-law \
  --location eastus
```

---

## 10. Configure Private Endpoints and Private DNS Zone Links

### Azure Portal GUI Steps
1. Search for Private endpoints.
2. Click Create.
3. Choose the resource group and VNet/subnet.
4. Select the Key Vault resource.
5. Create the private endpoint.
6. Then create a Private DNS zone and link it to the VNet.

Private endpoints secure access to Key Vault and optional storage/account services.

```bash
az network private-endpoint create \
  --name swarity-kv-pe \
  --resource-group swarity-rg \
  --vnet-name swarity-vnet \
  --subnet private-subnet \
  --private-connection-resource-id <key-vault-resource-id> \
  --group-id vault \
  --connection-name swarity-kv-conn
```

Create and link a private DNS zone:

```bash
az network private-dns zone create \
  --resource-group swarity-rg \
  --name privatelink.vaultcore.azure.net

az network private-dns link vnet create \
  --resource-group swarity-rg \
  --zone-name privatelink.vaultcore.azure.net \
  --name swarity-vnet-link \
  --virtual-network swarity-vnet \
  --registration-enabled false
```

---

## 11. Enable TLS Certificate Validation and SNI

### Azure Portal GUI Steps
1. In the App Service, go to TLS/SSL settings.
2. Upload or import your certificate.
3. Bind it to the custom domain.
4. Select SNI for the binding.
5. Verify that minimum TLS version is 1.2 or higher.

Use a custom domain and certificate for production.

```bash
az webapp config ssl upload \
  --resource-group swarity-rg \
  --name swarity-app \
  --certificate-file cert.pfx \
  --certificate-password <certificate-password>
```

Bind with SNI:

```bash
az webapp config ssl bind \
  --resource-group swarity-rg \
  --name swarity-app \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

Validate TLS settings:

```bash
az webapp config show \
  --resource-group swarity-rg \
  --name swarity-app \
  --query "siteConfig.minTlsVersion"
```

---

## 12. Configure APIM for API Gateway

### Azure Portal GUI Steps
1. Search for API Management.
2. Click Create.
3. Choose the resource group and a Premium SKU.
4. Create the APIM instance.
5. Add your API and enable rate limiting and CORS policies.

If Azure Functions or future APIs are used, place them behind APIM.

```bash
az apim create \
  --name swarity-apim \
  --resource-group swarity-rg \
  --publisher-name "Swarity" \
  --publisher-email "admin@Swarity.com" \
  --sku Premium \
  --virtual-network-type Internal
```

Add a rate-limit policy to protect APIs.

---

## 13. Deploy the Current Project Files

For this static frontend project, deploy the current website files to the App Service.

```bash
cd /path/to/project
zip -r swarity-app.zip . -x "*.git*" "*.env*"

az webapp deployment source config-zip \
  --resource-group swarity-rg \
  --name swarity-app \
  --src swarity-app.zip
```

For staging:

```bash
az webapp deployment source config-zip \
  --resource-group swarity-rg \
  --name swarity-app \
  --slot staging \
  --src swarity-app.zip
```

---

## 14. Final Validation Checklist

- App Service is running
- HTTPS-only is enabled
- VNet integration is enabled
- Managed Identity is created and assigned
- Key Vault is configured and reachable through private endpoint
- Private DNS links are created
- NSG and UDR are attached to the correct subnets
- Azure Firewall is configured for outbound traffic control
- Application Insights is connected
- Azure Monitor is collecting logs and metrics
- Deployment slots are configured
- Autoscaling is enabled
- Health check endpoint is available
- TLS is enforced and SNI binding is active

---

## Notes for This Specific Project

Because this current project is a frontend-only static website, the most important Azure items to implement first are:

1. App Service hosting
2. VNet integration
3. Managed Identity + Key Vault
4. Application Insights + Azure Monitor
5. Deployment slots and autoscaling
6. TLS/SNI and health checks
7. Private endpoints and private DNS for future secure backends

If later you add login, database access, or API endpoints, Azure Functions + APIM + Key Vault integration will be the next best upgrade path.

