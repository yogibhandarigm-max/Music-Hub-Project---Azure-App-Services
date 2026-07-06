module.exports = async function (context, req) {
  const { firstName, lastName, email, password, role } = req.body || {};

  if (!firstName || !lastName || !email || !password) {
    context.res = {
      status: 400,
      body: { error: 'First name, last name, email, and password are required.' }
    };
    return;
  }

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
