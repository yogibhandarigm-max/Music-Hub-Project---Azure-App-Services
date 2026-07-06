#!/usr/bin/env bash

RESOURCE_GROUP=${1:-swarity-rg}
TEMPLATE_FILE="infra/main.bicep"
PARAMETERS_FILE="infra/parameters.json"

echo "Deploying infrastructure to resource group: $RESOURCE_GROUP"
az deployment group create --resource-group "$RESOURCE_GROUP" --template-file "$TEMPLATE_FILE" --parameters "@$PARAMETERS_FILE"
