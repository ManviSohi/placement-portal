const express = require('express');
const router  = express.Router();
const ApplicationController = require('../controllers/application.controller');
const { protect }  = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const {
  applyValidator,
  applicationIdValidator,
} = require('../validators/application.validator');

router.use(protect);
router.use(authorize('student'));

router.post('/',      applyValidator,         validate, ApplicationController.apply);
router.get('/my',     ApplicationController.getMyApplications);
router.delete('/:id', applicationIdValidator, validate, ApplicationController.withdraw);

module.exports = router;
