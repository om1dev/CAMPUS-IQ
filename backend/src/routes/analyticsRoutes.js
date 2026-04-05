const express = require('express');
const ctrl = require('../controllers/analyticsController');
const { requireAuth } = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const departmentScope = require('../middleware/departmentScopeMiddleware');

const router = express.Router();

router.use(requireAuth, departmentScope);
router.get('/summary', allowRoles('admin', 'superadmin'), asyncHandler(ctrl.summary));

module.exports = router;
