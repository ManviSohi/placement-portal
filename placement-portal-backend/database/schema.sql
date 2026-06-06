CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--USERS
CREATE TABLE IF NOT EXIST users(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20)NOT NULL DEFAULT 'student',
          CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMP WITH TIMEZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIMEZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- STUDENT PROFILES
CREATE TABLE IF NOT EXISTS student_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- REFERENCES creates a foreign key constraint.
  -- ON DELETE CASCADE means: if the user is deleted, delete their profile too.
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  full_name       VARCHAR(100),
  university      VARCHAR(150),
  degree          VARCHAR(100),
  graduation_year SMALLINT CHECK (graduation_year BETWEEN 2000 AND 2035),
  bio             TEXT,
  resume_url      VARCHAR(500),
   phone           VARCHAR(20),
  linkedin_url    VARCHAR(300),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON student_profiles(user_id);


--SKILlS
CREATE TABLE IF NOT EXISTS skills (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_name  VARCHAR(100) NOT NULL,
  proficiency VARCHAR(20) DEFAULT 'intermediate'
                CHECK (proficiency IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);


--JOBS
CREATE TABLE IF NOT EXISTS jobs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(150) NOT NULL,
  company     VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  location    VARCHAR(100),
  type        VARCHAR(30) DEFAULT 'full-time'
                CHECK (type IN ('full-time', 'part-time', 'internship', 'contract', 'remote')),
  status      VARCHAR(20) DEFAULT 'open'
                CHECK (status IN ('open', 'closed', 'draft')),
  salary_min  INTEGER CHECK (salary_min >= 0),
  salary_max  INTEGER CHECK (salary_max >= 0),
  deadline    TIMESTAMP WITH TIME ZONE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Validate salary range at database level
  CONSTRAINT salary_range_check CHECK (salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min)
);

-- Indexes to support fast filtering and searching
CREATE INDEX IF NOT EXISTS idx_jobs_status   ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type     ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_company  ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_created_by ON jobs(created_by);
-- Full-text search index — supports fast LIKE queries on title
CREATE INDEX IF NOT EXISTS idx_jobs_title    ON jobs USING gin(to_tsvector('english', title));

--APPLICATIONS
CREATE TABLE IF NOT EXISTS applications(
        id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_id   UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
         status       VARCHAR(20) DEFAULT 'pending'
                 CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted')),
  cover_letter TEXT,
   applied_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- This UNIQUE constraint is critical:
  -- One student cannot apply to the same job twice
  UNIQUE(student_id, job_id)

);

CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id     ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status     ON applications(status);
        


--SEED DATA
--Admin user (password: Admin@123456)
INSERT INTO users (email, password_hash, role)
VALUES (
  'admin@placement.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgRdChYlKkMRhJhFl7SFk.',
  'admin'
) ON CONFLICT (email) DO NOTHING;