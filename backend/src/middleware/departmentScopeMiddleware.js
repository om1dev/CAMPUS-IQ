module.exports = function departmentScope(req, res, next) {
  const role = req.user?.profile?.role;
  const profile = req.user?.profile;

  req.scope = {
    role,
    user_id: profile?.id || null,
    department_id: profile?.department_id || null,
    assigned_faculty_id: profile?.assigned_faculty_id || null
  };

  next();
};
