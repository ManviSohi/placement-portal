// src/models/job.model.js
const pool = require('../config/db');

const JobModel = {

  // ─── PUBLIC / STUDENT QUERIES ──────────────────────────────────────────────

  // getJobs: the core browse/search/filter query
  // filters = { search, type, location, page, limit, offset }
  getJobs: async ({ search, type, location, limit, offset }) => {
    // Start with the mandatory condition: only show open jobs to students
    const conditions = [`status = 'open'`];
    const values = [];
    let paramIndex = 1;

    // Search: matches title OR company (case-insensitive partial match)
    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR company ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }

    // Filter: exact match on job type (internship, full-time, etc.)
    if (type) {
      conditions.push(`type = $${paramIndex}`);
      values.push(type);
      paramIndex++;
    }

    // Filter: partial match on location (so "Bangalore" matches "Bangalore, India")
    if (location) {
      conditions.push(`location ILIKE $${paramIndex}`);
      values.push(`%${location}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // limit and offset are always the LAST two parameters
    const query = `
      SELECT
        id, title, company, location, type, status,
        salary_min, salary_max, deadline, created_at
      FROM jobs
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  },

  // countJobs: mirrors getJobs filters exactly, but returns a count
  // CRITICAL: the WHERE clause logic must match getJobs exactly,
  // otherwise pagination metadata will be wrong (e.g. "page 2 of 3"
  // but page 2 returns no results)
  countJobs: async ({ search, type, location }) => {
    const conditions = [`status = 'open'`];
    const values = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR company ILIKE $${paramIndex})`);
      values.push(`%${search}%`);
      paramIndex++;
    }
    if (type) {
      conditions.push(`type = $${paramIndex}`);
      values.push(type);
      paramIndex++;
    }
    if (location) {
      conditions.push(`location ILIKE $${paramIndex}`);
      values.push(`%${location}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');
    const query = `SELECT COUNT(*) AS total FROM jobs WHERE ${whereClause}`;

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].total, 10);
  },

  // getJobById: full job details for the job details page
  getJobById: async (jobId) => {
    const query = `
      SELECT
        id, title, company, description, location, type, status,
        salary_min, salary_max, deadline, created_at, updated_at
      FROM jobs
      WHERE id = $1
    `;
    const result = await pool.query(query, [jobId]);
    return result.rows[0];
  },

  // ─── ADMIN QUERIES ────────────────────────────────────────────────────────────

  // createJob: admin creates a new job posting
  createJob: async (adminId, jobData) => {
    const {
      title, company, description, location,
      type, status, salaryMin, salaryMax, deadline,
    } = jobData;

    const query = `
      INSERT INTO jobs (
        created_by, title, company, description, location,
        type, status, salary_min, salary_max, deadline
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      adminId, title, company, description, location,
      type || 'full-time',
      status || 'open',
      salaryMin || null,
      salaryMax || null,
      deadline || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // updateJob: same COALESCE pattern as student profile update
  updateJob: async (jobId, jobData) => {
    const {
      title, company, description, location,
      type, status, salaryMin, salaryMax, deadline,
    } = jobData;

    const query = `
      UPDATE jobs
      SET
        title       = COALESCE($1, title),
        company     = COALESCE($2, company),
        description = COALESCE($3, description),
        location    = COALESCE($4, location),
        type        = COALESCE($5, type),
        status      = COALESCE($6, status),
        salary_min  = COALESCE($7, salary_min),
        salary_max  = COALESCE($8, salary_max),
        deadline    = COALESCE($9, deadline),
        updated_at  = NOW()
      WHERE id = $10
      RETURNING *
    `;
    const values = [
      title ?? null, company ?? null, description ?? null, location ?? null,
      type ?? null, status ?? null, salaryMin ?? null, salaryMax ?? null,
      deadline ?? null, jobId,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // deleteJob: cascades to applications via ON DELETE CASCADE in schema.sql
  deleteJob: async (jobId) => {
    const query = `DELETE FROM jobs WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [jobId]);
    return result.rows[0];
  },

  // Used by application logic to check job existence + status before applying
  jobExistsAndOpen: async (jobId) => {
    const query = `SELECT id, status, deadline FROM jobs WHERE id = $1`;
    const result = await pool.query(query, [jobId]);
    return result.rows[0];
  },
};

module.exports = JobModel;