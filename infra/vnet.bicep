param vnetName string
param location string
param addressPrefix string = '10.0.0.0/16'
param appSubnetPrefix string = '10.0.1.0/24'
param funcSubnetPrefix string = '10.0.2.0/24'
param privateSubnetPrefix string = '10.0.3.0/24'
param firewallSubnetPrefix string = '10.0.4.0/26'
param appGatewaySubnetPrefix string = '10.0.5.0/26'

resource vnet 'Microsoft.Network/virtualNetworks@2023-05-01' = {
  name: vnetName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [addressPrefix]
    }
  }
}

resource appSubnet 'Microsoft.Network/virtualNetworks/subnets@2023-05-01' = {
  name: 'app-subnet'
  properties: {
    addressPrefix: appSubnetPrefix
  }
  parent: vnet
}

resource funcSubnet 'Microsoft.Network/virtualNetworks/subnets@2023-05-01' = {
  name: 'func-subnet'
  properties: {
    addressPrefix: funcSubnetPrefix
  }
  parent: vnet
}

resource privateSubnet 'Microsoft.Network/virtualNetworks/subnets@2023-05-01' = {
  name: 'private-subnet'
  properties: {
    addressPrefix: privateSubnetPrefix
  }
  parent: vnet
}

resource firewallSubnet 'Microsoft.Network/virtualNetworks/subnets@2023-05-01' = {
  name: 'AzureFirewallSubnet'
  properties: {
    addressPrefix: firewallSubnetPrefix
  }
  parent: vnet
}

resource appGatewaySubnet 'Microsoft.Network/virtualNetworks/subnets@2023-05-01' = {
  name: 'appgw-subnet'
  properties: {
    addressPrefix: appGatewaySubnetPrefix
  }
  parent: vnet
}

output vnetId string = vnet.id
output appSubnetId string = appSubnet.id
output funcSubnetId string = funcSubnet.id
output privateSubnetId string = privateSubnet.id
output firewallSubnetId string = firewallSubnet.id
output appGatewaySubnetId string = appGatewaySubnet.id
