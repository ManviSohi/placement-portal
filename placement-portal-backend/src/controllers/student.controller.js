// src/controllers/student.controller.js
const StudentModel = require('../models/student.model');
const { createError } = require('../middleware/error.middleware');
const { getPagination, buildPaginationMeta } = require('../utils/pagination.utils');
const { logger } = require('../utils/logger');

const StudentController = {

  // GET /api/students/profile
  getProfile: async (req, res, next) => {
    try {
      // req.user.id comes from the JWT token (set by protect middleware)
      const profile = await StudentModel.getProfileByUserId(req.user.id);

      if (!profile) {
        throw createError(404, 'Profile not found.');
      }

      res.status(200).json({
        success: true,
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/students/profile
  updateProfile: async (req, res, next) => {
    try {
      const updatedProfile = await StudentModel.updateProfile(
        req.user.id,
        req.body  // Validator has already cleaned this data
      );

      logger.info(`Profile updated for user: ${req.user.id}`);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: { profile: updatedProfile },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/students/skills
  getSkills: async (req, res, next) => {
    try {
      const skills = await StudentModel.getSkillsByUserId(req.user.id);

      res.status(200).json({
        success: true,
        data: { skills },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/students/skills
  addSkill: async (req, res, next) => {
    try {
      const { skillName, proficiency = 'intermediate' } = req.body;

      const skill = await StudentModel.addSkill(
        req.user.id,
        skillName,
        proficiency
      );

      res.status(201).json({
        success: true,
        message: 'Skill added successfully.',
        data: { skill },
      });
    } catch (error) {
      // PostgreSQL error code 23505 = unique_violation
      // This fires when student tries to add the same skill twice
      if (error.code === '23505') {
        return next(createError(409, 'You have already added this skill.'));
      }
      next(error);
    }
  },

  // DELETE /api/students/skills/:id
  deleteSkill: async (req, res, next) => {
    try {
      const deleted = await StudentModel.deleteSkill(req.params.id, req.user.id);

      // If nothing was deleted, the skill didn't exist OR didn't belong to this user
      if (!deleted) {
        throw createError(404, 'Skill not found.');
      }

      res.status(200).json({
        success: true,
        message: 'Skill deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = StudentController;