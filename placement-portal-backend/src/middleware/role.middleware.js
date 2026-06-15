// src/middleware/role.middleware.js
const { createError } = require('./error.middleware');

// authorize is a "middleware factory" — it returns a middleware function.
// This pattern lets us pass arguments to middleware.
//
// Usage: router.delete('/jobs/:id', protect, authorize('admin'), deleteJob)
// This says: "first verify JWT, then verify it's an admin, then run deleteJob"
//
// ...roles uses the rest parameter — authorize('admin', 'superadmin') works too
const authorize = (...roles) => {
  return (req, res, next) => {
    // protect middleware must run before authorize — it sets req.user
    if (!req.user) {
      return next(createError(401, 'Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        createError(403, `Access denied. Required role: ${roles.join(' or ')}.`)
        // 403 = Forbidden (authenticated but not authorized)
        // Different from 401 = Unauthorized (not authenticated at all)
      );
    }

    next();
  };
};

module.exports = { authorize };