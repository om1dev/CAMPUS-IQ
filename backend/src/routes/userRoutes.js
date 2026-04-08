const express = require('express');
const ctrl = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const departmentScope = require('../middleware/departmentScopeMiddleware');

const router = express.Router();

router.use(requireAuth, departmentScope);

router.post('/students', allowRoles('faculty', 'hod', 'admin', 'superadmin'), asyncHandler(ctrl.addStudent));
router.post('/faculty', allowRoles('hod', 'admin', 'superadmin'), asyncHandler(ctrl.addFaculty));
router.post('/hod', allowRoles('admin', 'superadmin'), asyncHandler(ctrl.addHod));
router.get('/assigned-students', allowRoles('faculty'), asyncHandler(ctrl.assignedStudents));
router.get('/', allowRoles('faculty', 'hod', 'admin', 'superadmin'), asyncHandler(ctrl.listUsers));
router.delete('/:id', allowRoles('faculty', 'hod', 'admin', 'superadmin'), asyncHandler(ctrl.deleteUser));

module.exports = router;
