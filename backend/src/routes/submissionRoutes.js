const express = require('express');
const ctrl = require('../controllers/submissionController');
const { requireAuth } = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const departmentScope = require('../middleware/departmentScopeMiddleware');

const router = express.Router();

router.use(requireAuth, departmentScope);

router.post('/submit/:tableName', allowRoles('student', 'faculty', 'hod', 'admin', 'superadmin'), asyncHandler(ctrl.submit));
router.get('/', asyncHandler(ctrl.list));
router.get('/:id', asyncHandler(ctrl.getById));
router.post('/approve/:id', allowRoles('faculty', 'hod', 'admin', 'superadmin'), asyncHandler(ctrl.approve));
router.post('/reject/:id', allowRoles('faculty', 'hod', 'admin', 'superadmin'), asyncHandler(ctrl.reject));

module.exports = router;
