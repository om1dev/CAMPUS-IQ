const { getAuthUserFromToken } = require('../services/authService');
const asyncHandler = require('./asyncHandler');

const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing bearer token' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const authUser = await getAuthUserFromToken(token);
  req.token = token;
  req.user = authUser;
  next();
});

module.exports = { requireAuth };
