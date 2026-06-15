const {body,param,query} =require('express-validator');

const applyValidator=[
body('jobId')
    .notEmpty().withMessage('Job ID is required')
    .isUUID().withMessage('Invalid Job ID format'),

body('coverLetter')
.optional()
.trim()
.isLength({max:500}).withMessage('Cover letter must not exceed 500 characters')

];

const updateStatusValidator=[
    param('id')
    .isUUID().withMessage('Invalid Application ID format'),

    body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending','accepted','rejected','reviewed','shortlisted']).withMessage('Status must be pending, accepted or rejected')
];

const applicationIdValidator=[
    param('id')
    .isUUID().withMessage('Invalid Application ID format')
];

const getApplicationsQueryValidator=[
    query('page').optional().isInt({min:1}),
    query('limit').optional().isInt({min:1,max:100}),
    query('status')
        .optional()
        .isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted']),
];

module.exports = {
  applyValidator,
  updateStatusValidator,
  applicationIdValidator,
  getApplicationsQueryValidator,
};