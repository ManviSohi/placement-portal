// src/controllers/admin.controller.js
const StudentModel = require('../models/student.model');
const { createError } = require('../middleware/error.middleware');
const { getPagination, buildPaginationMeta } = require('../utils/pagination.utils');

const AdminController = {

  // GET /api/admin/students?page=1&limit=10&search=john
  getAllStudents: async (req, res, next) => {
    try {
      const { page, limit, offset } = getPagination(req.query);
      // .trim() removes accidental whitespace from search terms
      const search = req.query.search?.trim() || null;

      // Run data query and count query in parallel
      const [students, totalCount] = await Promise.all([
        StudentModel.getAllStudents({ limit, offset, search }),
        StudentModel.countStudents(search),
      ]);

      const pagination = buildPaginationMeta(totalCount, page, limit);

      res.status(200).json({
        success: true,
        data: { students },
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/admin/students/:id
  getStudentById: async (req, res, next) => {
    try {
      const student = await StudentModel.getStudentWithSkills(req.params.id);

      if (!student) {
        throw createError(404, 'Student not found.');
      }

      res.status(200).json({
        success: true,
        data: { student },
      });
    } catch (error) {
      // If req.params.id is not a valid UUID format, PostgreSQL throws an error
      // We catch it and return a clean 400 instead of a 500
      if (error.code === '22P02') {
        return next(createError(400, 'Invalid student ID format.'));
      }
      next(error);
    }
  },
};

module.exports = AdminController;