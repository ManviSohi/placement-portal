// src/controllers/job.controller.js
const JobModel = require('../models/job.model');
const { createError } = require('../middleware/error.middleware');
const { getPagination, buildPaginationMeta } = require('../utils/pagination.utils');
const { logger } = require('../utils/logger');

const JobController = {

  // GET /api/jobs — browse, search, filter
  getJobs: async (req, res, next) => {
    try {
      const { page, limit, offset } = getPagination(req.query);

      // Extract and clean filter params
      const search   = req.query.search?.trim()   || null;
      const type     = req.query.type             || null;
      const location = req.query.location?.trim() || null;

      const filters = { search, type, location, limit, offset };

      // Run data + count queries in parallel
      const [jobs, totalCount] = await Promise.all([
        JobModel.getJobs(filters),
        JobModel.countJobs({ search, type, location }),
      ]);

      const pagination = buildPaginationMeta(totalCount, page, limit);

      res.status(200).json({
        success: true,
        data: { jobs },
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/jobs/:id
  getJobById: async (req, res, next) => {
    try {
      const job = await JobModel.getJobById(req.params.id);

      if (!job) {
        throw createError(404, 'Job not found.');
      }

      res.status(200).json({
        success: true,
        data: { job },
      });
    } catch (error) {
      if (error.code === '22P02') {
        return next(createError(400, 'Invalid job ID format.'));
      }
      next(error);
    }
  },

  // POST /api/admin/jobs
  createJob: async (req, res, next) => {
    try {
      // req.user.id is the admin's ID — recorded as created_by
      const job = await JobModel.createJob(req.user.id, req.body);

      logger.info(`Job created: "${job.title}" by admin ${req.user.id}`);

      res.status(201).json({
        success: true,
        message: 'Job created successfully.',
        data: { job },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/admin/jobs/:id
  updateJob: async (req, res, next) => {
    try {
      // First check the job exists — gives a clean 404 instead of
      // a successful-but-empty update
      const existing = await JobModel.getJobById(req.params.id);
      if (!existing) {
        throw createError(404, 'Job not found.');
      }

      const updatedJob = await JobModel.updateJob(req.params.id, req.body);

      logger.info(`Job updated: ${req.params.id} by admin ${req.user.id}`);

      res.status(200).json({
        success: true,
        message: 'Job updated successfully.',
        data: { job: updatedJob },
      });
    } catch (error) {
      if (error.code === '22P02') {
        return next(createError(400, 'Invalid job ID format.'));
      }
      next(error);
    }
  },

  // DELETE /api/admin/jobs/:id
  deleteJob: async (req, res, next) => {
    try {
      const deleted = await JobModel.deleteJob(req.params.id);

      if (!deleted) {
        throw createError(404, 'Job not found.');
      }

      logger.info(`Job deleted: ${req.params.id} by admin ${req.user.id}`);

      res.status(200).json({
        success: true,
        message: 'Job deleted successfully.',
      });
    } catch (error) {
      if (error.code === '22P02') {
        return next(createError(400, 'Invalid job ID format.'));
      }
      next(error);
    }
  },
};

module.exports = JobController;