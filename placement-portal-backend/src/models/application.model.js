// src/models/application.model.js
const pool = require('../config/db');

const ApplicationModel = {

  // ─── STUDENT QUERIES ───────────────────────────────────────────────────────

  // Apply for a job
  create: async ({ studentId, jobId, coverLetter }) => {
    const query = `
      INSERT INTO applications (student_id, job_id, cover_letter)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    // The UNIQUE(student_id, job_id) constraint in schema.sql will
    // automatically reject duplicate applications with error code 23505.
    // We catch that in the controller for a clean error message.
    const result = await pool.query(query, [studentId, jobId, coverLetter || null]);
    return result.rows[0];
  },

  // Check if a student already applied for a specific job
  findExisting: async (studentId, jobId) => {
    const query = `
      SELECT id FROM applications
      WHERE student_id = $1 AND job_id = $2
    `;
    const result = await pool.query(query, [studentId, jobId]);
    return result.rows[0];
  },

  // Get all applications for the logged-in student
  // JOIN with jobs to show job details alongside application status
  getByStudentId: async (studentId) => {
    const query = `
      SELECT
        a.id              AS application_id,
        a.status          AS application_status,
        a.cover_letter,
        a.applied_at,
        a.updated_at,
        j.id              AS job_id,
        j.title,
        j.company,
        j.location,
        j.type,
        j.salary_min,
        j.salary_max,
        j.deadline
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.student_id = $1
      ORDER BY a.applied_at DESC
    `;
    const result = await pool.query(query, [studentId]);
    return result.rows;
  },

  // Withdraw (delete) an application.
  // CRITICAL: must verify student_id to prevent one student deleting
  // another student's application.
  withdraw: async (applicationId, studentId) => {
    const query = `
      DELETE FROM applications
      WHERE id = $1 AND student_id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [applicationId, studentId]);
    return result.rows[0];
  },

  // ─── ADMIN QUERIES ─────────────────────────────────────────────────────────

  // Get all applications with student and job info
  getAll: async ({ limit, offset, status }) => {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Optional filter: show only applications with a specific status
    if (status) {
      conditions.push(`a.status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    const query = `
      SELECT
        a.id              AS application_id,
        a.status          AS application_status,
        a.applied_at,
        a.updated_at,
        u.id              AS student_id,
        u.email           AS student_email,
        sp.full_name      AS student_name,
        j.id              AS job_id,
        j.title           AS job_title,
        j.company
      FROM applications a
      JOIN users u           ON a.student_id = u.id
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      JOIN jobs j            ON a.job_id = j.id
      ${whereClause}
      ORDER BY a.applied_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  },

  countAll: async (status) => {
    let query;
    let values;

    if (status) {
      query = `SELECT COUNT(*) AS total FROM applications WHERE status = $1`;
      values = [status];
    } else {
      query = `SELECT COUNT(*) AS total FROM applications`;
      values = [];
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total, 10);
  },

  // Update application status — PATCH endpoint
  updateStatus: async (applicationId, status) => {
    const query = `
      UPDATE applications
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [status, applicationId]);
    return result.rows[0];
  },

  // ─── STATS QUERY ───────────────────────────────────────────────────────────

  // getDashboardStats: all statistics in one efficient query using
  // conditional aggregation (COUNT with FILTER) instead of multiple queries.
  // One round trip to the database instead of 5+.
  getDashboardStats: async () => {
    // We run three queries in parallel using Promise.all.
    // Each targets a different table so they don't block each other.
    const [appStats, jobStats, studentStats] = await Promise.all([

      // Applications breakdown by status
      pool.query(`
        SELECT
          COUNT(*)                                    AS total_applications,
          COUNT(*) FILTER (WHERE status = 'pending')      AS pending,
          COUNT(*) FILTER (WHERE status = 'reviewed')     AS reviewed,
          COUNT(*) FILTER (WHERE status = 'shortlisted')  AS shortlisted,
          COUNT(*) FILTER (WHERE status = 'accepted')     AS accepted,
          COUNT(*) FILTER (WHERE status = 'rejected')     AS rejected,
          COUNT(*) FILTER (WHERE applied_at >= NOW() - INTERVAL '7 days') AS this_week
        FROM applications
      `),

      // Jobs breakdown by status
      pool.query(`
        SELECT
          COUNT(*)                                    AS total_jobs,
          COUNT(*) FILTER (WHERE status = 'open')    AS open_jobs,
          COUNT(*) FILTER (WHERE status = 'closed')  AS closed_jobs,
          COUNT(*) FILTER (WHERE status = 'draft')   AS draft_jobs
        FROM jobs
      `),

      // Total registered students
      pool.query(`
        SELECT COUNT(*) AS total_students
        FROM users
        WHERE role = 'student'
      `),
    ]);

    // Top 5 jobs by application count — useful for admin dashboard
    const topJobsResult = await pool.query(`
      SELECT
        j.id,
        j.title,
        j.company,
        COUNT(a.id) AS application_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      GROUP BY j.id, j.title, j.company
      ORDER BY application_count DESC
      LIMIT 5
    `);

    return {
      applications: appStats.rows[0],
      jobs: jobStats.rows[0],
      students: studentStats.rows[0],
      topJobs: topJobsResult.rows,
    };
  },
};

module.exports = ApplicationModel;