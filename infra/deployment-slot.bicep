param webAppName string
param slotName string = 'staging'

resource deploymentSlot 'Microsoft.Web/sites/slots@2022-03-01' = {
  name: '${webAppName}/${slotName}'
  properties: {
    serverFarmId: resourceId('Microsoft.Web/serverfarms', 'swarity-plan')
  }
}

output deploymentSlotId string = deploymentSlot.id
