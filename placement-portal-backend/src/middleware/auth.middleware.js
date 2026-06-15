// src/middleware/auth.middleware.js
const { verifyToken } = require('../utils/jwt.utils');
const { createError } = require('./error.middleware');

// protect: this middleware runs before any protected route.
// It extracts the token from the Authorization header,
// verifies it, and attaches the decoded user to req.user.
// Every subsequent middleware and controller can then read req.user.
const protect = (req, res, next) => {
  try {
    // The Authorization header format is: "Bearer eyJhbGci..."
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // createError makes an Error object with a statusCode property
      throw createError(401, 'Access denied. No token provided.');
    }

    // Split "Bearer eyJhbGci..." into ["Bearer", "eyJhbGci..."]
    // and take the second part
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw createError(401, 'Access denied. Token missing.');
    }

    // verifyToken either returns the decoded payload or throws.
    // If it throws, our catch block runs.
    const decoded = verifyToken(token);

    // Attach the decoded payload to the request object.
    // Controllers access this via req.user.id, req.user.role, etc.
    req.user = decoded;

    // next() passes control to the next middleware or controller
    next();

  } catch (error) {
    // Handle JWT-specific errors with clear messages
    if (error.name === 'TokenExpiredError') {
      return next(createError(401, 'Token has expired. Please log in again.'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(createError(401, 'Invalid token.'));
    }
    next(error);
  }
};

module.exports = { protect };