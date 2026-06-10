// src/middleware/validate.middleware.js
const { validationResult } = require('express-validator');

// This middleware runs AFTER the validator chains.
// It collects all validation errors and, if any exist,
// stops the request and returns a 422 response.
// 422 = "Unprocessable Entity" — the server understood the request
// but the data was invalid.
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      // errors.array() gives [{field, message}, ...] — useful for form highlighting
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  // If no errors, pass control to the controller
  next();
};

module.exports = { validate };