// src/validators/auth.validator.js
const { body } = require('express-validator');

// express-validator lets us define validation rules as arrays.
// Each item is a "chain" of rules for one field.
// These are used as middleware — they run before the controller.

const registerValidator = [
  body('email')
    .trim()                          // Remove leading/trailing spaces
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()                // Lowercase, remove dots in gmail, etc.
    .isLength({ max: 255 }).withMessage('Email too long'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .isLength({ max: 128 }).withMessage('Password too long')
    // Regex: at least one uppercase, one lowercase, one number
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number')
    .matches(/[!@#$%^&*]/)
    .withMessage('Password must contain at least one special character (!@#$%^&*)'),

  body('role')
    .optional()
    .isIn(['student', 'admin']).withMessage('Role must be student or admin'),
];

const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

module.exports = { registerValidator, loginValidator };