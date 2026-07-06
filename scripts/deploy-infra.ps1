param(
  [string]$resourceGroupName = 'swarity-rg',
  [string]$templateFile = '.\infra\main.bicep',
  [string]$parametersFile = '.\infra\parameters.json'
)

Write-Host "Deploying infrastructure to resource group: $resourceGroupName"
az deployment group create --resource-group $resourceGroupName --template-file $templateFile --parameters @$parametersFile
