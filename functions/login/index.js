const bcrypt = require('bcryptjs');
const { getUserByEmail } = require('../db');
const { signToken } = require('../auth');

module.exports = async function (context, req) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    context.res = {
      status: 400,
      body: { error: 'Email and password are required.' }
    };
    return;
  }

  const user = await getUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    context.res = {
      status: 401,
      body: { error: 'Invalid email or password.' }
    };
    return;
  }

  const token = await signToken({
    email: user.rowKey,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role
  });

  context.res = {
    status: 200,
    body: {
      message: 'Login successful',
      token,
      user: {
        email: user.rowKey,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    }
  };
};
