param location string
param privateSubnetId string
param storageAccountId string
param keyVaultId string
param privateDnsZoneName string

resource storagePrivateEndpoint 'Microsoft.Network/privateEndpoints@2023-05-01' = {
  name: 'swarity-storage-pe'
  location: location
  properties: {
    subnet: {
      id: privateSubnetId
    }
    privateLinkServiceConnections: [
      {
        name: 'storageConnection'
        properties: {
          privateLinkServiceId: storageAccountId
          groupIds: [
            'blob'
          ]
        }
      }
    ]
  }
}

resource keyVaultPrivateEndpoint 'Microsoft.Network/privateEndpoints@2023-05-01' = {
  name: 'swarity-keyvault-pe'
  location: location
  properties: {
    subnet: {
      id: privateSubnetId
    }
    privateLinkServiceConnections: [
      {
        name: 'keyVaultConnection'
        properties: {
          privateLinkServiceId: keyVaultId
          groupIds: [
            'vault'
          ]
        }
      }
    ]
  }
}

resource privateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = {
  name: privateDnsZoneName
  location: 'global'
}

resource dnsLink 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = {
  name: '${privateDnsZone.name}/swarity-vnet-link'
  location: 'global'
  properties: {
    virtualNetwork: {
      id: split(privateSubnetId, '/subnets/')[0]
    }
    registrationEnabled: false
  }
}

output storagePrivateEndpointId string = storagePrivateEndpoint.id
output keyVaultPrivateEndpointId string = keyVaultPrivateEndpoint.id
output privateDnsZoneId string = privateDnsZone.id
