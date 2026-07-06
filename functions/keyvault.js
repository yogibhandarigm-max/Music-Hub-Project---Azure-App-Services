const { SecretClient } = require('@azure/keyvault-secrets');
const { DefaultAzureCredential } = require('@azure/identity');

const keyVaultName = process.env.KEY_VAULT_NAME;
const keyVaultUrl = keyVaultName ? `https://${keyVaultName}.vault.azure.net` : null;
const client = keyVaultUrl ? new SecretClient(keyVaultUrl, new DefaultAzureCredential()) : null;

async function getSecret(secretName) {
  if (!client) {
    throw new Error('KEY_VAULT_NAME is not configured. Set KEY_VAULT_NAME in environment variables or local.settings.json.');
  }
  const secret = await client.getSecret(secretName);
  return secret.value;
}

module.exports = {
  getSecret
};
