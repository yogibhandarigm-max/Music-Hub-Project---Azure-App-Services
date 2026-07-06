const assert = require('assert');
const { signToken } = require('../functions/auth');

describe('Azure Functions helper tests', function () {
  it('should sign a token payload when JWT secret exists', async function () {
    process.env.JWT_SECRET = 'test-secret';
    const token = await signToken({ email: 'test@example.com' });
    assert.ok(token, 'Expected token to be generated');
  });
});
