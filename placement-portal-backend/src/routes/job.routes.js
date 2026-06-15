const express =require('express');
const router = express.Router();
const JobController=require('../controllers/job.controller');
const {validate}=require('../middleware/validate.middleware');
const {
    jobIdValidator,
    getJobsQueryValidator,
}=require('../validators/job.validator');

//These routes are intentionally NOT protected.
//Browsing jobs should be open to all users, even non-logged-in ones.
//If we want to make them protected, we can add `protect` middleware.

router.get('/', getJobsQueryValidator, validate, JobController.getJobs);
router.get('/:id', jobIdValidator, validate, JobController.getJobById);

module.exports = router;