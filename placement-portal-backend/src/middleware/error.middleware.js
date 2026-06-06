//Global error handler


const config = require('../config/env');
const { logger } = require('../utils/logger');

// This is Express's special "error handling middleware".
// It has FOUR parameters — (err, req, res, next).
// Express recognizes 4-param functions as error handlers automatically.
// Any time you call next(error) anywhere in your app,
// Express skips all normal middleware and comes here.
const errorHandler = (err, req, res, next) => {
  // Log the full error server-side (with stack trace for debugging)
  logger.error(`${req.method} ${req.url} — ${err.message}`, err.stack);

  // Default to 500 if no status code was set on the error object
  const statusCode = err.statusCode || err.status || 500;

  // Build the response object
  const response = {
    success: false,
    message: err.message || 'Internal server error',
    // Only show the stack trace in development — never in production!
    // Stack traces reveal your folder structure and code to attackers
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
};

// A helper function to create errors with a status code.
// Usage: throw createError(404, 'Job not found')
// Instead of manually setting err.statusCode everywhere.
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = { errorHandler, createError };