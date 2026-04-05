module.exports = function allowRoles(...roles) {
  return function roleCheck(req, res, next) {
    if (!req.user?.profile?.role) {
      return res.status(403).json({ success: false, message: 'Role not found' });
    }

    if (!roles.includes(req.user.profile.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    next();
  };
};
