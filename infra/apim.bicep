param apiManagementName string
param location string

resource apiManagement 'Microsoft.ApiManagement/service@2022-08-01' = {
  name: apiManagementName
  location: location
  sku: {
    name: 'Developer'
    capacity: 1
  }
  properties: {
    publisherName: 'Swarity'
    publisherEmail: 'admin@swarity.com'
  }
}

output apiManagementId string = apiManagement.id
