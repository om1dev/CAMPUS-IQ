const express = require('express');
const ctrl = require('../controllers/recordsController');
const { requireAuth } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const departmentScope = require('../middleware/departmentScopeMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(requireAuth, departmentScope);

router.get('/meta/tables', asyncHandler(ctrl.meta));
router.get('/:tableName', asyncHandler(ctrl.list));
router.get('/:tableName/:id', asyncHandler(ctrl.getById));
router.post('/:tableName', upload.single('file'), asyncHandler(ctrl.create));
router.put('/:tableName/:id', upload.single('file'), asyncHandler(ctrl.update));
router.delete('/:tableName/:id', asyncHandler(ctrl.remove));

module.exports = router;
