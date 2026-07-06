const { TableClient, AzureNamedKeyCredential } = require('@azure/data-tables');
const { getSecret } = require('./keyvault');

const tableName = process.env.USER_TABLE_NAME || 'Users';
const accountName = process.env.STORAGE_ACCOUNT_NAME;
let accountKey = process.env.STORAGE_ACCOUNT_KEY;

async function resolveAccountKey() {
  if (accountKey) {
    return accountKey;
  }

  const secretName = process.env.STORAGE_ACCOUNT_KEY_SECRET_NAME || 'StorageAccountKey';
  accountKey = await getSecret(secretName);
  return accountKey;
}

async function createClient() {
  if (!accountName) {
    throw new Error('STORAGE_ACCOUNT_NAME must be configured in environment variables.');
  }
  const key = await resolveAccountKey();
  if (!key) {
    throw new Error('Storage account key could not be resolved from environment or Key Vault.');
  }
  const credential = new AzureNamedKeyCredential(accountName, key);
  return new TableClient(`https://${accountName}.table.core.windows.net`, tableName, credential);
}

async function ensureTable(client) {
  try {
    await client.createTable();
  } catch (err) {
    if (err.statusCode !== 409) {
      throw err;
    }
  }
}

async function createUser(user) {
  const client = await createClient();
  await ensureTable(client);
  return client.createEntity(user);
}

async function getUserByEmail(email) {
  const client = await createClient();
  await ensureTable(client);
  const entity = await client.getEntity('USER', email).catch((err) => {
    if (err.statusCode === 404) return null;
    throw err;
  });
  return entity;
}

module.exports = {
  createUser,
  getUserByEmail
};
