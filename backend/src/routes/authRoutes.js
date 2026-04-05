const express = require('express');
const ctrl = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/signup', asyncHandler(ctrl.signup));
router.post('/login', asyncHandler(ctrl.login));
router.get('/me', requireAuth, asyncHandler(ctrl.me));

module.exports = router;
