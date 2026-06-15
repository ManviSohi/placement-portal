const ApplicationModel = require('../models/application.model');
const JobModel         = require('../models/job.model');
const { createError }  = require('../middleware/error.middleware');
const { getPagination, buildPaginationMeta } = require('../utils/pagination.utils');
const { logger }       = require('../utils/logger');


const ApplicationController = {
      apply: async (req, res, next) => {
    try {
      const { jobId, coverLetter } = req.body;
      const studentId = req.user.id;

      // Step 1 & 2 & 3 — one DB call covers all three
      const job = await JobModel.jobExistsAndOpen(jobId);

      if (!job) {
        throw createError(404, 'Job not found.');
      }
      if (job.status !== 'open') {
        throw createError(400, 'This job is no longer accepting applications.');
      }
      if (job.deadline && new Date(job.deadline) < new Date()) {
        throw createError(400, 'The application deadline for this job has passed.');
      }

      // Step 4 — check for duplicate application
      const existing = await ApplicationModel.findExisting(studentId, jobId);
      if (existing) {
        throw createError(409, 'You have already applied for this job.');
      }

      // All checks passed — create the application
      const application = await ApplicationModel.create({
        studentId,
        jobId,
        coverLetter,
      });

      logger.info(`Student ${studentId} applied for job ${jobId}`);

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully.',
        data: { application },
      });
    } catch (error) {
      // Fallback for race condition: two simultaneous apply requests
      // Both pass the duplicate check, but only one INSERT succeeds.
      // The second hits the DB-level UNIQUE constraint.
      if (error.code === '23505') {
        return next(createError(409, 'You have already applied for this job.'));
      }
      next(error);
    }
  },
 // GET /api/applications/my
  getMyApplications: async (req, res, next) => {
    try {
      const applications = await ApplicationModel.getByStudentId(req.user.id);

      res.status(200).json({
        success: true,
        data: { applications },
      });
    } catch (error) {
      next(error);
    }
  },

    // DELETE /api/applications/:id
  withdraw: async (req, res, next) => {
    try {
      const deleted = await ApplicationModel.withdraw(
        req.params.id,
        req.user.id
      );

      if (!deleted) {
        throw createError(404, 'Application not found.');
      }
      res.status(200).json({
        success: true,
        message: 'Application withdrawn successfully.',
      });
    } catch (error) {
      if (error.code === '22P02') {
        return next(createError(400, 'Invalid application ID format.'));
      }
      next(error);
    }
  },

 // ─── ADMIN HANDLERS ────────────────────────────────────────────────────────

  // GET /api/admin/applications
  getAllApplications: async (req, res, next) => {
    try {
    const { page, limit, offset } = getPagination(req.query);
    const status = req.query.status || null;
    const jobId  = req.query.jobId  || null;

    const filters = { status, jobId, limit, offset };

    const [applications, totalCount] = await Promise.all([
      ApplicationModel.getAll(filters),
      ApplicationModel.countAll({ status, jobId }), // ← updated call
    ]);
       const pagination = buildPaginationMeta(totalCount, page, limit);

      res.status(200).json({
        success: true,
        data: { applications },
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },
  // PATCH /api/admin/applications/:id/status
  updateStatus: async (req, res, next) => {
    try {
      const updated = await ApplicationModel.updateStatus(
        req.params.id,
        req.body.status
      );

      if (!updated) {
        throw createError(404, 'Application not found.');
      }
        logger.info(
        `Application ${req.params.id} status → ${req.body.status} by admin ${req.user.id}`
      );

      res.status(200).json({
        success: true,
        message: `Application status updated to "${req.body.status}".`,
        data: { application: updated },
      });
    } catch (error) {
      if (error.code === '22P02') {
        return next(createError(400, 'Invalid application ID format.'));
      }
      next(error);
      }
  },

  // GET /api/admin/stats
  getDashboardStats: async (req, res, next) => {
    try {
      const stats = await ApplicationModel.getDashboardStats();

      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
         }
  },
};

module.exports = ApplicationController;



