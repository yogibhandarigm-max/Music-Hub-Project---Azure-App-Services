# SoundWave - Azure Implementation Guide for This Project

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

## 1. Prerequisites

- Azure subscription
- Azure CLI installed and signed in
- Basic knowledge of App Service, Key Vault, and VNet concepts

```bash
az login
az account set --subscription "<your-subscription-id>"
az --version
```

---

## 2. Create the Core Resource Group

### Azure Portal GUI Steps
1. Open the Azure portal.
2. Go to Resource groups.
3. Click Create.
4. Enter name: soundwave-rg.
5. Select a region such as East US.
6. Click Review + create, then Create.

```bash
az group create --name soundwave-rg --location eastus
```

---

## 3. Create a VNet and Required Subnets

### Azure Portal GUI Steps
1. In the portal, search for Virtual networks.
2. Click Create.
3. Choose the resource group soundwave-rg.
4. Name the VNet soundwave-vnet.
5. Set the address space to 10.0.0.0/16.
6. Add subnets:
   - app-subnet: 10.0.1.0/24
   - func-subnet: 10.0.2.0/24
   - private-subnet: 10.0.3.0/24
7. Click Review + create.

This project should use a private network for production readiness.

```bash
az network vnet create \
  --resource-group soundwave-rg \
  --name soundwave-vnet \
  --address-prefix 10.0.0.0/16 \
  --subnet-name app-subnet \
  --subnet-prefix 10.0.1.0/24

az network vnet subnet create \
  --resource-group soundwave-rg \
  --vnet-name soundwave-vnet \
  --name func-subnet \
  --address-prefix 10.0.2.0/24

az network vnet subnet create \
  --resource-group soundwave-rg \
  --vnet-name soundwave-vnet \
  --name private-subnet \
  --address-prefix 10.0.3.0/24
```

### Network Security Group (NSG)

### Azure Portal GUI Steps
1. Search for Network security groups in the portal.
2. Click Create.
3. Name it soundwave-nsg.
4. Choose the same resource group.
5. Click Review + create.
6. After creation, go to Inbound security rules and add rules for HTTPS/HTTP as needed.

```bash
az network nsg create \
  --resource-group soundwave-rg \
  --name soundwave-nsg
```

### Route Table (UDR)

### Azure Portal GUI Steps
1. Search for Route tables.
2. Click Create.
3. Name it soundwave-udr.
4. Select the resource group.
5. Add a route pointing to the firewall or next hop appliance.

```bash
az network route-table create \
  --resource-group soundwave-rg \
  --name soundwave-udr
```

### Azure Firewall

### Azure Portal GUI Steps
1. Search for Azure Firewall.
2. Click Create.
3. Choose the resource group and region.
4. Create or use a public IP.
5. Configure the firewall policy and associate it to the VNet.

```bash
az network firewall create \
  --resource-group soundwave-rg \
  --name soundwave-firewall \
  --location eastus \
  --sku AZFW_VNet
```

---

## 4. Create App Service Plan and Web App

### Azure Portal GUI Steps
1. In the portal, search for App Services.
2. Click Create.
3. Choose the resource group soundwave-rg.
4. Enter a unique app name such as soundwave-app.
5. Select a paid plan such as P1v2.
6. Choose Node.js 18 LTS runtime.
7. Click Review + create.

Use a paid App Service plan for production features such as deployment slots, autoscaling, VNet integration, and health checks.

```bash
az appservice plan create \
  --name soundwave-plan \
  --resource-group soundwave-rg \
  --sku P1v2 \
  --is-linux

az webapp create \
  --resource-group soundwave-rg \
  --plan soundwave-plan \
  --name soundwave-app \
  --runtime "NODE|18-lts"
```

### Enable HTTPS Only

```bash
az webapp update --resource-group soundwave-rg --name soundwave-app --https-only true
```

### Enable VNet Integration

### Azure Portal GUI Steps
1. Open the App Service.
2. Go to Networking.
3. Under VNet integration, click Add VNet.
4. Select soundwave-vnet and app-subnet.
5. Save the change.

```bash
az webapp vnet-integration add \
  --resource-group soundwave-rg \
  --name soundwave-app \
  --vnet soundwave-vnet \
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
  --resource-group soundwave-rg \
  --name soundwave-app \
  --generic-configurations '{"healthCheckPath":"/health"}'
```

---

## 5. Add Managed Identity and Key Vault

### Azure Portal GUI Steps
1. Search for Managed Identities.
2. Click Create.
3. Name it soundwave-identity.
4. Select the resource group and region.
5. Click Review + create.

### Create Managed Identity

```bash
az identity create \
  --resource-group soundwave-rg \
  --name soundwave-identity
```

### Create Key Vault

### Azure Portal GUI Steps
1. Search for Key Vaults.
2. Click Create.
3. Choose the resource group.
4. Enter a unique name such as soundwave-kv-<unique>.
5. Select Standard SKU.
6. Click Review + create.

```bash
az keyvault create \
  --resource-group soundwave-rg \
  --name soundwave-kv-<unique> \
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
  --name soundwave-kv-<unique> \
  --object-id <managed-identity-principal-id> \
  --secret-permissions get list \
  --key-permissions get list \
  --certificate-permissions get list
```

### Store App Settings in Key Vault

Use Key Vault references in App Service app settings where possible.

```bash
az webapp config appsettings set \
  --resource-group soundwave-rg \
  --name soundwave-app \
  --settings "KEY_VAULT_URI=https://soundwave-kv-<unique>.vault.azure.net/"
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
  --resource-group soundwave-rg \
  --plan soundwave-plan \
  --name soundwave-func \
  --runtime node --runtime-version 18 \
  --functions-version 4
```

Assign the same managed identity and connect the function app to the VNet.

```bash
az webapp vnet-integration add \
  --resource-group soundwave-rg \
  --name soundwave-func \
  --vnet soundwave-vnet \
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
  --resource-group soundwave-rg \
  --name soundwave-app \
  --slot staging
```

Deploy to staging first, test, then swap:

```bash
az webapp deployment slot swap \
  --resource-group soundwave-rg \
  --name soundwave-app \
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
  --resource-group soundwave-rg \
  --resource soundwave-plan \
  --resource-type Microsoft.Web/serverfarms \
  --name soundwave-autoscale \
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
4. Name the resource soundwave-ai.
5. Select the same region.
6. Click Review + create.

```bash
az monitor app-insights component create \
  --app soundwave-ai \
  --location eastus \
  --resource-group soundwave-rg \
  --kind web
```

Link the app to Application Insights:

```bash
az webapp config appsettings set \
  --resource-group soundwave-rg \
  --name soundwave-app \
  --settings \
  APPLICATIONINSIGHTS_CONNECTION_STRING="<connection-string>" \
  ApplicationInsightsAgent_EXTENSION_VERSION="~3"
```

Enable diagnostics logs to Log Analytics.

```bash
az monitor log-analytics workspace create \
  --resource-group soundwave-rg \
  --workspace-name soundwave-law \
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
  --name soundwave-kv-pe \
  --resource-group soundwave-rg \
  --vnet-name soundwave-vnet \
  --subnet private-subnet \
  --private-connection-resource-id <key-vault-resource-id> \
  --group-id vault \
  --connection-name soundwave-kv-conn
```

Create and link a private DNS zone:

```bash
az network private-dns zone create \
  --resource-group soundwave-rg \
  --name privatelink.vaultcore.azure.net

az network private-dns link vnet create \
  --resource-group soundwave-rg \
  --zone-name privatelink.vaultcore.azure.net \
  --name soundwave-vnet-link \
  --virtual-network soundwave-vnet \
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
  --resource-group soundwave-rg \
  --name soundwave-app \
  --certificate-file cert.pfx \
  --certificate-password <certificate-password>
```

Bind with SNI:

```bash
az webapp config ssl bind \
  --resource-group soundwave-rg \
  --name soundwave-app \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

Validate TLS settings:

```bash
az webapp config show \
  --resource-group soundwave-rg \
  --name soundwave-app \
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
  --name soundwave-apim \
  --resource-group soundwave-rg \
  --publisher-name "SoundWave" \
  --publisher-email "admin@soundwave.com" \
  --sku Premium \
  --virtual-network-type Internal
```

Add a rate-limit policy to protect APIs.

---

## 13. Deploy the Current Project Files

For this static frontend project, deploy the current website files to the App Service.

```bash
cd /path/to/project
zip -r soundwave-app.zip . -x "*.git*" "*.env*"

az webapp deployment source config-zip \
  --resource-group soundwave-rg \
  --name soundwave-app \
  --src soundwave-app.zip
```

For staging:

```bash
az webapp deployment source config-zip \
  --resource-group soundwave-rg \
  --name soundwave-app \
  --slot staging \
  --src soundwave-app.zip
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
