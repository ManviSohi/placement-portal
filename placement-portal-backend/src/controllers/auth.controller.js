const UserModel = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/bcrypt.utils');
const { generateToken } = require('../utils/jwt.utils');
const { createError } = require('../middleware/error.middleware');
const { logger } = require('../utils/logger');

const AuthController = {

  // POST /api/auth/register
  register: async (req, res, next) => {
    try {
      // Destructure validated fields from request body
      // At this point, validators have already run — data is clean
      const { email, password, role } = req.body;

      // Check for duplicate email
      // We do this in the controller because it's business logic,
      // not a database query concern
      const emailExists = await UserModel.existsByEmail(email);
      if (emailExists) {
        // 409 = Conflict — the resource already exists
        throw createError(409, 'An account with this email already exists.');
      }

      // Hash the password BEFORE storing
      // Never store plain text passwords — ever
      const passwordHash = await hashPassword(password);

      // Create user + profile in a single transaction
      const newUser = await UserModel.create({
        email,
        passwordHash,
        role: role || 'student',
      });

      // Generate a JWT immediately so the user is logged in after registering
      const token = generateToken({
        id: newUser.id,
        role: newUser.role,
      });

      logger.info(`New user registered: ${email} (${newUser.role})`);

      // 201 = Created (not 200) — a new resource was created
      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.created_at,
          },
          token,
        },
      });

    } catch (error) {
      // Pass to the global error handler in error.middleware.js
      next(error);
    }
  },

  // POST /api/auth/login
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Find the user by email
      const user = await UserModel.findByEmail(email);

      // SECURITY: Use a generic message for both "user not found" and
      // "wrong password". Never tell attackers which one failed —
      // that would let them enumerate valid email addresses.
      if (!user) {
        throw createError(401, 'Invalid email or password.');
      }

      // Compare the submitted password with the stored hash
      const isPasswordValid = await comparePassword(password, user.password_hash);
      if (!isPasswordValid) {
        throw createError(401, 'Invalid email or password.');
      }

      // Generate token with minimal payload
      const token = generateToken({
        id: user.id,
        role: user.role,
      });

      logger.info(`User logged in: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
          },
          token,
        },
      });

    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/me — returns current user info from their token

getMe: async (req, res, next) => {
    try {
      // req.user was set by the protect middleware
      // We look up fresh data from DB in case the user updated their email
      const user = await UserModel.findById(req.user.id);

      if (!user) {
        throw createError(404, 'User not found.');
      }

      res.status(200).json({
        success: true,
        data: { user },
      });

    } catch (error) {
      next(error);
    }
  },


    // POST /api/auth/logout
  // With JWT, logout is handled client-side (delete the token).
  // This endpoint exists for logging and to clear any future cookie-based auth.
  logout: (req, res) => {
    logger.info(`User logged out: ${req.user?.id}`);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  },
};

module.exports = AuthController;
