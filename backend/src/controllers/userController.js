const authService = require('../services/authService');
const userService = require('../services/userService');

async function addStudent(req, res) {
  const creator = req.user;
  const role = creator.profile.role;

  if (!['faculty', 'hod', 'admin', 'superadmin'].includes(role)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const department_id = role === 'faculty' || role === 'hod'
    ? creator.profile.department_id
    : (req.body.department_id || null);

  const assigned_faculty_id = role === 'faculty'
    ? creator.profile.id
    : (req.body.assigned_faculty_id || null);

  const result = await authService.createUserByAdmin({
    ...req.body,
    role: 'student',
    department_id,
    assigned_faculty_id
  }, creator);

  return res.json({
    success: true,
    message: 'Student created successfully',
    ...result
  });
}

async function addFaculty(req, res) {
  const creator = req.user;
  const role = creator.profile.role;

  if (!['hod', 'admin', 'superadmin'].includes(role)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const department_id = role === 'hod'
    ? creator.profile.department_id
    : (req.body.department_id || null);

  const result = await authService.createUserByAdmin({
    ...req.body,
    role: 'faculty',
    department_id
  }, creator);

  return res.json({
    success: true,
    message: 'Faculty created successfully',
    ...result
  });
}

async function listUsers(req, res) {
  const actor = req.user;
  const filters = {
    role: req.query.role || undefined,
    department_id: req.query.department_id || undefined
  };

  if (actor.profile.role === 'faculty') {
    filters.assigned_faculty_id = actor.profile.id;
    filters.role = 'student';
  }

  if (actor.profile.role === 'hod') {
    filters.department_id = actor.profile.department_id;
  }

  const users = await userService.listUsers(filters);
  return res.json({ success: true, users });
}

async function assignedStudents(req, res) {
  const users = await userService.listAssignedStudents(req.user.profile.id);
  return res.json({ success: true, users });
}

module.exports = {
  addStudent,
  addFaculty,
  listUsers,
  assignedStudents
};
