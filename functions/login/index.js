module.exports = async function (context, req) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    context.res = {
      status: 400,
      body: { error: 'Email and password are required.' }
    };
    return;
  }

  context.res = {
    status: 200,
    body: {
      message: 'Login successful',
      user: { email }
    }
  };
};
