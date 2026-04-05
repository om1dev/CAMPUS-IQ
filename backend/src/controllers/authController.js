const authService = require('../services/authService');

async function signup(req, res) {
  const data = await authService.signUpUser(req.body);
  return res.json({
    success: true,
    message: 'Signup successful',
    ...data
  });
}

async function login(req, res) {
  const data = await authService.loginUser(req.body);
  return res.json({
    success: true,
    message: 'Login successful',
    ...data
  });
}

async function me(req, res) {
  return res.json({
    success: true,
    user: req.user.auth,
    profile: req.user.profile
  });
}

module.exports = { signup, login, me };
