// src/models/student.model.js
const pool = require('../config/db');

const StudentModel = {

  // Get a student's profile joined with their basic user data.
  // We JOIN users and student_profiles so the controller gets everything in one query.
  // One query is always better than two separate queries.
  getProfileByUserId: async (userId) => {
    const query = `
      SELECT
        u.id,
        u.email,
        u.role,
        u.created_at,
        sp.full_name,
        sp.university,
        sp.degree,
        sp.graduation_year,
        sp.bio,
        sp.resume_url,
        sp.phone,
        sp.linkedin_url,
        sp.updated_at AS profile_updated_at
      FROM users u
      LEFT JOIN student_profiles sp ON u.id = sp.user_id
      WHERE u.id = $1
    `;
    // LEFT JOIN: return the user row even if no profile row exists.
    // INNER JOIN would return nothing if the profile is missing.
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  },

  // Update a student's profile.
  // We use COALESCE to only update fields that were actually provided.
  // COALESCE(a, b) returns a if a is not null, otherwise b.
  // This means: "use the new value if provided, otherwise keep the existing one."
  // This implements a safe PATCH-style behavior even on a PUT endpoint.
  updateProfile: async (userId, profileData) => {
    const {
      fullName,
      university,
      degree,
      graduationYear,
      bio,
      resumeUrl,
      phone,
      linkedinUrl,
    } = profileData;

    const query = `
      UPDATE student_profiles
      SET
        full_name       = COALESCE($1, full_name),
        university      = COALESCE($2, university),
        degree          = COALESCE($3, degree),
        graduation_year = COALESCE($4, graduation_year),
        bio             = COALESCE($5, bio),
        resume_url      = COALESCE($6, resume_url),
        phone           = COALESCE($7, phone),
        linkedin_url    = COALESCE($8, linkedin_url),
        updated_at      = NOW()
      WHERE user_id = $9
      RETURNING *
    `;
    // Pass null for missing fields — COALESCE keeps the existing DB value
    const values = [
      fullName      ?? null,
      university    ?? null,
      degree        ?? null,
      graduationYear ?? null,
      bio           ?? null,
      resumeUrl     ?? null,
      phone         ?? null,
      linkedinUrl   ?? null,
      userId,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  // ─── SKILLS ──────────────────────────────────────────────────────────────────

  getSkillsByUserId: async (userId) => {
    const query = `
      SELECT id, skill_name, proficiency, created_at
      FROM skills
      WHERE user_id = $1
      ORDER BY created_at ASC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  addSkill: async (userId, skillName, proficiency) => {
    const query = `
      INSERT INTO skills (user_id, skill_name, proficiency)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    // The UNIQUE(user_id, skill_name) constraint in schema.sql means
    // PostgreSQL will throw an error if the student tries to add the same
    // skill twice. We'll catch that specific error in the controller.
    const result = await pool.query(query, [userId, skillName, proficiency]);
    return result.rows[0];
  },

  deleteSkill: async (skillId, userId) => {
    // We include user_id in the WHERE clause — this is critical security.
    // Without it, a student could delete another student's skills
    // by guessing a skill UUID. Always scope deletions to the owner.
    const query = `
      DELETE FROM skills
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [skillId, userId]);
    // If rows[0] is undefined, the skill wasn't found or didn't belong to this user
    return result.rows[0];
  },

  // ─── ADMIN QUERIES ────────────────────────────────────────────────────────────

  // Get all students with pagination and optional search.
  // This query uses full-text search on name and university.
  getAllStudents: async ({ limit, offset, search }) => {
    // We build the query dynamically based on whether search is provided.
    // $1 and $2 are always limit and offset.
    // $3 is the search term (only when search is provided).
    let query;
    let values;

    if (search) {
      // ILIKE = case-insensitive LIKE. '%term%' matches anywhere in the string.
      // We search across full_name, university, and email.
      query = `
        SELECT
          u.id, u.email, u.role, u.created_at,
          sp.full_name, sp.university, sp.degree, sp.graduation_year
        FROM users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        WHERE u.role = 'student'
          AND (
            sp.full_name   ILIKE $3
            OR sp.university ILIKE $3
            OR u.email       ILIKE $3
          )
        ORDER BY u.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      values = [limit, offset, `%${search}%`];
    } else {
      query = `
        SELECT
          u.id, u.email, u.role, u.created_at,
          sp.full_name, sp.university, sp.degree, sp.graduation_year
        FROM users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        WHERE u.role = 'student'
        ORDER BY u.created_at DESC
        LIMIT $1 OFFSET $2
      `;
      values = [limit, offset];
    }

    const result = await pool.query(query, values);
    return result.rows;
  },

  // Get the total count — needed to calculate total pages.
  // We run this separately because COUNT(*) with LIMIT doesn't work as expected.
  countStudents: async (search) => {
    let query;
    let values;

    if (search) {
      query = `
        SELECT COUNT(*) AS total
        FROM users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        WHERE u.role = 'student'
          AND (
            sp.full_name   ILIKE $1
            OR sp.university ILIKE $1
            OR u.email       ILIKE $1
          )
      `;
      values = [`%${search}%`];
    } else {
      query = `SELECT COUNT(*) AS total FROM users WHERE role = 'student'`;
      values = [];
    }

    const result = await pool.query(query, values);
    // COUNT returns a string in pg — parseInt converts it to a number
    return parseInt(result.rows[0].total, 10);
  },

  // Get one student's full profile including skills — for admin view
  getStudentWithSkills: async (userId) => {
    // Run two queries in parallel using Promise.all.
    // This is faster than running them sequentially.
    // Sequential: 20ms + 10ms = 30ms total
    // Parallel:   max(20ms, 10ms) = 20ms total
    const [profileResult, skillsResult] = await Promise.all([
      pool.query(`
        SELECT u.id, u.email, u.created_at,
               sp.full_name, sp.university, sp.degree,
               sp.graduation_year, sp.bio, sp.resume_url,
               sp.phone, sp.linkedin_url
        FROM users u
        LEFT JOIN student_profiles sp ON u.id = sp.user_id
        WHERE u.id = $1 AND u.role = 'student'
      `, [userId]),
      pool.query(`
        SELECT id, skill_name, proficiency FROM skills WHERE user_id = $1
      `, [userId]),
    ]);

    if (!profileResult.rows[0]) return null;

    return {
      ...profileResult.rows[0],
      skills: skillsResult.rows,
    };
  },
};

module.exports = StudentModel;