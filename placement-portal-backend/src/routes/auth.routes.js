const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { registerValidator, loginValidator } = require('../validators/auth.validator');
const { validate } = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

// HTTP_METHOD + PATH + [...middleware chain] + controller function
// If any middleware calls next(error), the chain stops and goes to error handler.
// POST /api/auth/register
router.post('/register', registerValidator, validate, AuthController.register);

// POST /api/auth/login
router.post('/login', loginValidator, validate, AuthController.login);

// GET /api/auth/me  — protected: must be logged in
router.get('/me', protect, AuthController.getMe);

// POST /api/auth/logout — protected: must be logged in
router.post('/logout', protect, AuthController.logout);

module.exports = router;