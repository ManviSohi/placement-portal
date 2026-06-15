// src/routes/student.routes.js
const express = require('express');
const router  = express.Router();
const StudentController = require('../controllers/student.controller');
const { protect }       = require('../middleware/auth.middleware');
const { authorize }     = require('../middleware/role.middleware');
const { validate }      = require('../middleware/validate.middleware');
const {
  updateProfileValidator,
  addSkillValidator,
  skillIdValidator,
} = require('../validators/student.validator');

// All student routes require: (1) valid JWT, (2) role = student
// Instead of repeating protect + authorize on every route,
// we apply them once to the entire router with router.use()
router.use(protect);
router.use(authorize('student'));

// Profile routes
router.get('/profile', StudentController.getProfile);
router.put('/profile', updateProfileValidator, validate, StudentController.updateProfile);

// Skills routes
router.get('/skills', StudentController.getSkills);
router.post('/skills', addSkillValidator, validate, StudentController.addSkill);
router.delete('/skills/:id', skillIdValidator, validate, StudentController.deleteSkill);

module.exports = router;