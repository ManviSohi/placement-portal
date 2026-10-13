# placement-portal
# 🎓 Student Placement Portal

A production-ready, full-stack student placement portal that connects students with job opportunities and gives admins complete control over listings and applications.

> Built as a portfolio project following real startup engineering practices — MVC architecture, JWT authentication, role-based access, pagination, search, and cloud deployment.

---


## ✨ Features

### Student
- Register and log in securely with JWT authentication
- View and update profile (university, degree, bio, resume URL, LinkedIn)
- Add, view, and delete skills with proficiency levels
- Browse all open job listings
- Search jobs by title or company
- Filter jobs by type and location
- Paginated job results
- Apply for jobs with an optional cover letter
- View all applications with real-time status tracking
- Withdraw pending applications
- Dashboard with profile completeness indicator and application stats

### Admin
- Secure admin login (separate role)
- Dashboard with live statistics — total students, open jobs, applications by status, top jobs
- Create, edit, and delete job postings
- Set job type, location, salary range, deadline, and status (open / closed / draft)
- View all student applications (paginated, filterable by status and job)
- Update application status: Pending → Reviewed → Shortlisted → Accepted / Rejected

---

## 🛠️ Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| React Router v6 | Client-side routing |
| Axios | HTTP client with request/response interceptors |
| Context API | Global authentication state |
| CSS custom properties | Theming and responsive design |

### Backend
| Tool | Purpose |
|---|---|
| Node.js + Express.js | Server and REST API |
| PostgreSQL (`pg`) | Relational database |
| JWT (`jsonwebtoken`) | Stateless authentication |
| bcryptjs | Password hashing (12 salt rounds) |
| express-validator | Input validation and sanitization |
| Helmet | Security HTTP headers |
| CORS | Cross-origin request handling |
| express-rate-limit | Brute-force protection |
| Morgan | HTTP request logging |

### Infrastructure
| Service | Purpose |
|---|---|
| Neon | Serverless PostgreSQL (cloud database) |
| Render | Backend Node.js hosting |
| Vercel | Frontend static hosting |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────┐
│              Client tier (Vercel)                   │
│  React + Vite │ Context API │ Axios │ React Router  │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS / REST
┌────────────────────────▼────────────────────────────┐
│              Server tier (Render)                   │
│  Helmet │ CORS │ Rate limiter │ JWT middleware       │
│  Express Router → Controllers → Models              │
└────────────────────────┬────────────────────────────┘
                         │ pg connection pool
┌────────────────────────▼────────────────────────────┐
│              Data tier (Neon)                       │
│  users │ student_profiles │ skills │ jobs │ apps    │
└─────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Tables

**`users`** — authentication only
```sql
id UUID PK | email VARCHAR UNIQUE | password_hash VARCHAR | role VARCHAR | created_at | updated_at
```

**`student_profiles`** — one-to-one with users
```sql
id UUID PK | user_id UUID FK | full_name | university | degree | graduation_year | bio | resume_url | phone | linkedin_url
```

**`skills`** — many per student
```sql
id UUID PK | user_id UUID FK | skill_name VARCHAR | proficiency VARCHAR | created_at
UNIQUE(user_id, skill_name)
```

**`jobs`** — created by admins
```sql
id UUID PK | created_by UUID FK | title | company | description | location | type | status | salary_min | salary_max | deadline
```

**`applications`** — junction table (students ↔ jobs)
```sql
id UUID PK | student_id UUID FK | job_id UUID FK | status VARCHAR | cover_letter TEXT | applied_at
UNIQUE(student_id, job_id)
```

### Relationships
```
users ──────────── student_profiles   (1 : 1)
users ──────────── skills             (1 : many)
users ──────────── applications       (1 : many)
jobs  ──────────── applications       (1 : many)
users (admin) ──── jobs               (1 : many)
```

---

## 📡 API Reference

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | None | Register a new student account |
| POST | `/login` | None | Login and receive JWT token |
| GET | `/me` | JWT | Get current authenticated user |
| POST | `/logout` | JWT | Logout (client clears token) |

### Students — `/api/students`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/profile` | Student | Get own profile + skills |
| PUT | `/profile` | Student | Update own profile |
| GET | `/skills` | Student | Get own skills list |
| POST | `/skills` | Student | Add a new skill |
| DELETE | `/skills/:id` | Student | Delete a skill |

### Jobs — `/api/jobs`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Browse jobs — supports `?search=`, `?type=`, `?location=`, `?page=`, `?limit=` |
| GET | `/:id` | Public | Get full job details |

### Applications — `/api/applications`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | Student | Apply for a job |
| GET | `/my` | Student | Get own applications |
| DELETE | `/:id` | Student | Withdraw an application |

### Admin — `/api/admin`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/students` | Admin | List all students (paginated, searchable) |
| GET | `/students/:id` | Admin | View one student with skills |
| POST | `/jobs` | Admin | Create a job posting |
| PUT | `/jobs/:id` | Admin | Update a job posting |
| DELETE | `/jobs/:id` | Admin | Delete a job (cascades to applications) |
| GET | `/applications` | Admin | List all applications (filterable by status, jobId) |
| PATCH | `/applications/:id/status` | Admin | Update application status |
| GET | `/stats` | Admin | Dashboard statistics |

---

## 📁 Backend Folder Structure

```
placement-portal-backend/
├── src/
│   ├── config/
│   │   ├── db.js               # PostgreSQL connection pool
│   │   └── env.js              # Environment variable loader + validation
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── student.controller.js
│   │   ├── job.controller.js
│   │   ├── application.controller.js
│   │   └── admin.controller.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── student.model.js
│   │   ├── job.model.js
│   │   └── application.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── student.routes.js
│   │   ├── job.routes.js
│   │   ├── application.routes.js
│   │   └── admin.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT verification
│   │   ├── role.middleware.js   # Role-based access control
│   │   ├── validate.middleware.js
│   │   └── error.middleware.js  # Global error handler
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── student.validator.js
│   │   ├── job.validator.js
│   │   └── application.validator.js
│   ├── utils/
│   │   ├── jwt.utils.js
│   │   ├── bcrypt.utils.js
│   │   ├── pagination.utils.js
│   │   └── logger.js
│   └── app.js                  # Express app setup
├── database/
│   └── schema.sql              # All CREATE TABLE statements + seed data
├── .env.example
├── server.js                   # Entry point
└── package.json
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js v18+
- A [Neon](https://neon.tech) account (free tier is fine)
- Git

### 1 — Clone the repository

```bash
git clone https://github.com/ManviSohi/placement-portal.git
cd placement-portal
```

### 2 — Set up the database

1. Create a project on [neon.tech](https://neon.tech)
2. Copy your connection string
3. Open the Neon SQL editor and run the contents of `database/schema.sql`

### 3 — Set up the backend

```bash
cd placement-portal-backend
npm install
cp .env.example .env
```

Fill in `.env`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
JWT_SECRET=your_minimum_32_character_secret_here
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
FRONTEND_URL=http://localhost:5173
```

```bash
npm run dev
# Server running at http://localhost:5000
# Visit http://localhost:5000/health to confirm
```

### 4 — Set up the frontend

```bash
cd placement-portal-frontend
npm install
cp .env.example .env
```

Fill in `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
npm run dev
# App running at http://localhost:5173
```

### 5 — Default admin credentials

```
Email:    admin@placement.com
Password: Admin@123456
```

> Change these immediately in production via the Neon SQL editor.

---

## ☁️ Deployment

### Database — Neon
Already in the cloud. Use your Neon connection string as `DATABASE_URL`.

### Backend — Render
1. Push backend folder to GitHub
2. Render → New Web Service → connect repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all `.env` variables in the Environment tab
6. Set `NODE_ENV=production`

### Frontend — Vercel
1. Push frontend folder to GitHub
2. Vercel → New Project → import repo
3. Framework: Vite (auto-detected)
4. Add environment variable: `VITE_API_BASE_URL=https://your-api.onrender.com/api`
5. Deploy

### Connect them
After both are deployed, update the backend's `FRONTEND_URL` on Render to your Vercel domain and redeploy.

---

## 🔒 Security Features

- Passwords hashed with bcrypt (12 salt rounds — ~400ms per hash, brute-force resistant)
- JWT tokens expire after 7 days — users are forced to re-authenticate
- HTTP security headers via Helmet (XSS protection, clickjacking prevention, CSP)
- Rate limiting — 100 requests per 15 minutes per IP
- All SQL queries use parameterized statements — SQL injection impossible
- Role-based route protection — students cannot access admin endpoints
- Ownership checks on all mutations — students cannot modify other students' data
- Stack traces hidden in production responses
- `.env` never committed — `.gitignore` enforced from first commit

---

## 🧪 Testing the API

Import the following base URL into Postman: `http://localhost:5000`

### Quick test sequence
```
1. POST /api/auth/register       → get token
2. POST /api/auth/login          → get token
3. GET  /api/auth/me             → verify token works
4. PUT  /api/students/profile    → update profile
5. POST /api/students/skills     → add a skill
6. GET  /api/jobs                → browse jobs (no auth needed)
7. POST /api/applications        → apply for a job
8. GET  /api/applications/my     → see your application
9. POST /api/auth/login (admin)  → get admin token
10. GET /api/admin/stats         → view dashboard data
```

---

## 🎓 What I learned building this

- Designing a normalized relational database from an ER diagram to production SQL
- Implementing stateless JWT authentication with role-based access control
- Building dynamic, parameterized SQL queries for search, filter, and pagination
- Using PostgreSQL transactions (`BEGIN / COMMIT / ROLLBACK`) to guarantee data consistency
- Structuring a Node.js backend using MVC architecture for maintainability
- Protecting against common web vulnerabilities (SQL injection, IDOR, user enumeration, brute-force)
- Managing global auth state in React with Context API and custom hooks
- Debouncing search inputs to avoid excessive API calls
- Deploying a full-stack app across three separate cloud providers

---

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/ManviSohi)


---

## 📄 License

MIT — feel free to use this project as a reference or starting point.
