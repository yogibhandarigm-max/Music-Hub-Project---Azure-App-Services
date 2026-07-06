const crypto = require('crypto');
const { createUser, getUserByEmail } = require('../db');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = async function (context, req) {
  const { firstName, lastName, email, password, role } = req.body || {};

  if (!firstName || !lastName || !email || !password) {
    context.res = {
      status: 400,
      body: { error: 'First name, last name, email, and password are required.' }
    };
    return;
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    context.res = {
      status: 409,
      body: { error: 'A user with this email already exists.' }
    };
    return;
  }

  const passwordHash = hashPassword(password);

  await createUser({
    partitionKey: 'USER',
    rowKey: email,
    firstName,
    lastName,
    email,
    passwordHash,
    role: role || 'Music Enthusiast'
  });

  context.res = {
    status: 201,
    body: {
      message: 'Signup successful',
      user: {
        firstName,
        lastName,
        email,
        role: role || 'Music Enthusiast'
      }
    }
  };
};
