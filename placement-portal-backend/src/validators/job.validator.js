// src/validators/job.validator.js
const { body, param, query } = require('express-validator');

// Validators for creating/editing jobs (admin only)
const createJobValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Job title is required')
    .isLength({ min: 3, max: 150 }).withMessage('Title must be 3-150 characters'),

  body('company')
    .trim()
    .notEmpty().withMessage('Company name is required')
    .isLength({ min: 2, max: 150 }).withMessage('Company name must be 2-150 characters'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20, max: 5000 }).withMessage('Description must be 20-5000 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Location too long'),

  body('type')
    .optional()
    .isIn(['full-time', 'part-time', 'internship', 'contract', 'remote'])
    .withMessage('Invalid job type'),

  body('status')
    .optional()
    .isIn(['open', 'closed', 'draft'])
    .withMessage('Invalid status'),

  body('salaryMin')
    .optional()
    .isInt({ min: 0 }).withMessage('Minimum salary must be a positive number'),

  body('salaryMax')
    .optional()
    .isInt({ min: 0 }).withMessage('Maximum salary must be a positive number')
    // custom() lets us write our own validation logic
    // We compare salaryMax against salaryMin from the SAME request body
    .custom((value, { req }) => {
      if (req.body.salaryMin && value < req.body.salaryMin) {
        throw new Error('Maximum salary cannot be less than minimum salary');
      }
      return true;
    }),

  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date (YYYY-MM-DD)')
    // Ensure deadline is in the future
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be a future date');
      }
      return true;
    }),
];

// updateJobValidator: same rules but ALL fields optional (PATCH-style update)
const updateJobValidator = [
  body('title').optional().trim().isLength({ min: 3, max: 150 }),
  body('company').optional().trim().isLength({ min: 2, max: 150 }),
  body('description').optional().trim().isLength({ min: 20, max: 5000 }),
  body('location').optional().trim().isLength({ max: 100 }),
  body('type').optional().isIn(['full-time', 'part-time', 'internship', 'contract', 'remote']),
  body('status').optional().isIn(['open', 'closed', 'draft']),
  body('salaryMin').optional().isInt({ min: 0 }),
  body('salaryMax').optional().isInt({ min: 0 }),
  body('deadline').optional().isISO8601(),
];

// jobIdValidator: validates the :id URL parameter is a real UUID
const jobIdValidator = [
  param('id').isUUID().withMessage('Invalid job ID format'),
];

// getJobsQueryValidator: validates query string params for browsing/filtering
const getJobsQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  query('search').optional().trim().isLength({ max: 100 }),
  query('type').optional().isIn(['full-time', 'part-time', 'internship', 'contract', 'remote']),
  query('location').optional().trim().isLength({ max: 100 }),
];

module.exports = {
  createJobValidator,
  updateJobValidator,
  jobIdValidator,
  getJobsQueryValidator,
};