const jwt = require('jsonwebtoken');
const { getSecret } = require('./keyvault');

const secretName = process.env.JWT_SECRET_NAME || 'JwtSecret';

async function getJwtSecret() {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  return getSecret(secretName);
}

async function signToken(payload) {
  const secret = await getJwtSecret();
  if (!secret) {
    throw new Error('JWT secret is not configured in environment variables or Key Vault.');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '1h'
  });
}

module.exports = {
  signToken,
  getJwtSecret
};
