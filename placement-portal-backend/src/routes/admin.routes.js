// src/routes/admin.routes.js
const express = require('express');
const router  = express.Router();
const AdminController = require('../controllers/admin.controller');
const JobController   = require('../controllers/job.controller');
const { protect }     = require('../middleware/auth.middleware');
const { authorize }   = require('../middleware/role.middleware');
const { validate }    = require('../middleware/validate.middleware');
const {
  createJobValidator,
  updateJobValidator,
  jobIdValidator,
} = require('../validators/job.validator');

router.use(protect);
router.use(authorize('admin'));

// Student management (existing)
router.get('/students',     AdminController.getAllStudents);
router.get('/students/:id', AdminController.getStudentById);

// Job management (NEW)
router.post('/jobs',          createJobValidator, validate, JobController.createJob);
router.put('/jobs/:id',       jobIdValidator, updateJobValidator, validate, JobController.updateJob);
router.delete('/jobs/:id',    jobIdValidator, validate, JobController.deleteJob);

module.exports = router;