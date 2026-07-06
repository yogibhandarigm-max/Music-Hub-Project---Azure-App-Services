param location string = 'eastus'
param tags object = {
  project: 'Swarity'
  environment: 'dev'
  owner: 'Swarity Team'
}
param vnetName string = 'swarity-vnet'
param storageAccountName string = 'swaritystorage${uniqueString(resourceGroup().id)}'
param appServicePlanName string = 'swarity-plan'
param webAppName string = 'swarity-app'
param functionAppName string = 'swarity-functions'
param keyVaultName string = 'swarity-kv'
param appInsightsName string = 'swarity-ai'
param apiManagementName string = 'swarity-apim'
param publicIpName string = 'swarity-fw-pip'
param firewallName string = 'swarity-firewall'
param firewallPolicyName string = 'swarity-fwpolicy'
param appGatewayName string = 'swarity-appgw'
param appGatewayPublicIpName string = 'swarity-appgw-pip'
param privateDnsZoneName string = 'privatelink.blob.core.windows.net'
param privateDnsZoneVault string = 'privatelink.vaultcore.azure.net'

module storage 'storage.bicep' = {
  name: 'storageModule'
  params: {
    storageAccountName: storageAccountName
    location: location
  }
}

module keyVault 'keyvault.bicep' = {
  name: 'keyVaultModule'
  params: {
    keyVaultName: keyVaultName
    location: location
  }
}

module monitoring 'monitoring.bicep' = {
  name: 'monitoringModule'
  params: {
    appInsightsName: appInsightsName
    location: location
  }
}

module vnet 'vnet.bicep' = {
  name: 'vnetModule'
  params: {
    vnetName: vnetName
    location: location
  }
}

module appService 'appservice.bicep' = {
  name: 'appServiceModule'
  params: {
    appServicePlanName: appServicePlanName
    webAppName: webAppName
    location: location
  }
}

module functionsApp 'functions.bicep' = {
  name: 'functionsModule'
  params: {
    functionAppName: functionAppName
    location: location
    serverFarmId: appService.outputs.appServicePlanId
    storageConnectionString: storage.outputs.storageAccountConnectionString
    appInsightsConnectionString: monitoring.outputs.appInsightsConnectionString
    appInsightsInstrumentationKey: monitoring.outputs.appInsightsInstrumentationKey
  }
}

module apim 'apim.bicep' = {
  name: 'apimModule'
  params: {
    apiManagementName: apiManagementName
    location: location
  }
}

module firewall 'firewall.bicep' = {
  name: 'firewallModule'
  params: {
    location: location
    firewallName: firewallName
    publicIpName: publicIpName
    firewallPolicyName: firewallPolicyName
    vnetName: vnetName
    resourceGroupName: resourceGroup().name
  }
}

module appGateway 'app-gateway.bicep' = {
  name: 'appGatewayModule'
  params: {
    appGatewayName: appGatewayName
    appGatewayPublicIpName: appGatewayPublicIpName
    location: location
    subnetId: vnet.outputs.appGatewaySubnetId
    backendFqdn: '${webAppName}.azurewebsites.net'
  }
}

module privateEndpoints 'private-endpoint.bicep' = {
  name: 'privateEndpointsModule'
  params: {
    location: location
    privateSubnetId: vnet.outputs.privateSubnetId
    storageAccountId: storage.outputs.storageAccountId
    keyVaultId: keyVault.outputs.keyVaultId
    privateDnsZoneName: privateDnsZoneName
  }
}

module deploymentSlot 'deployment-slot.bicep' = {
  name: 'deploymentSlotModule'
  params: {
    webAppName: webAppName
    slotName: 'staging'
  }
}
