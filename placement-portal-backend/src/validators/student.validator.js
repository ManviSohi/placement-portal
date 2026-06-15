// src/validators/student.validator.js
const { body, param } = require('express-validator');

const updateProfileValidator = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('university')
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage('University name too long'),

  body('degree')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Degree name too long'),

  body('graduationYear')
    .optional()
    .isInt({ min: 2000, max: 2035 })
    .withMessage('Graduation year must be between 2000 and 2035'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters'),

  body('resumeUrl')
    .optional()
    .trim()
    // isURL validates it's a real URL format — no random strings
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Resume URL must be a valid URL (http or https)'),

  body('phone')
    .optional()
    .trim()
    // isMobilePhone with 'any' accepts international numbers
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),

  body('linkedinUrl')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('LinkedIn URL must be a valid URL'),
];

const addSkillValidator = [
  body('skillName')
    .trim()
    .notEmpty().withMessage('Skill name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Skill name must be between 1 and 100 characters'),

  body('proficiency')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Proficiency must be: beginner, intermediate, advanced, or expert'),
];

// param() validates URL parameters like /skills/:id
const skillIdValidator = [
  param('id')
    .isUUID().withMessage('Invalid skill ID format'),
];

module.exports = { updateProfileValidator, addSkillValidator, skillIdValidator };