# R&D Management System Starter (Node.js + Express + Supabase + React + Vite)

This starter includes:

- **Backend**: Node.js + Express + Supabase Auth + Supabase DB + Supabase Storage
- **Frontend**: React + Vite + Tailwind CSS + Axios + React Router
- **Auth roles**: `student`, `faculty`, `hod`, `admin`, `superadmin`
- **Workflow**:
  - Student submission → Faculty → HOD → Admin
  - Faculty submission → HOD → Admin
  - HOD submission → Admin
- **16 R&D tables** with dynamic forms
- **Submission logs** timeline
- **Department based filtering**
- **Faculty can add students**
- **HOD can add faculty**
- **Admin analytics**
- **Export to Excel / PDF**
- **Supabase Storage** file upload support

## Assumptions used
You did not provide the exact 16 R&D table names, so this starter uses these 16 academic R&D tables:

1. publications
2. patents
3. projects
4. books
5. book_chapters
6. conferences
7. workshops
8. seminars
9. certifications
10. awards
11. consultancies
12. grants
13. collaborations
14. internships_guided
15. phd_guidance
16. events_organized

Each table has a common structure plus a flexible `data jsonb` field so you can extend fields without changing the backend architecture.

## Setup

### 1) Create Supabase project
Create a new Supabase project from the Supabase dashboard.

### 2) Run SQL
Open Supabase SQL Editor and run:

- `supabase/schema.sql`

This creates:
- departments
- profiles
- submissions
- submission_items
- submission_logs
- all 16 R&D tables
- storage bucket `rd-files`

### 3) Backend setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 4) Frontend setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Important environment variables

### backend/.env
- `PORT`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FRONTEND_URL`
- `SUPABASE_STORAGE_BUCKET`

### frontend/.env
- `VITE_API_BASE_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## First user bootstrap
You can create your first admin or superadmin in two ways:

1. Use Supabase dashboard Auth → Add user, then insert matching row in `profiles`
2. Use the backend signup endpoint with:
   - role `student` only for public signup
3. Use `admin` or `superadmin` created manually first, then create others from UI/API

## Notes
- Backend uses **Supabase service role** and applies authorization in Express.
- JWT validation is done using Supabase Auth `getUser(token)`.
- Signed URLs are generated for uploaded files on fetch.
- Frontend is intentionally minimal but functional.

## API summary

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users
- `POST /api/users/students`
- `POST /api/users/faculty`
- `GET /api/users`
- `GET /api/users/assigned-students`

### Records
- `GET /api/records/meta/tables`
- `GET /api/records/:tableName`
- `GET /api/records/:tableName/:id`
- `POST /api/records/:tableName`
- `PUT /api/records/:tableName/:id`
- `DELETE /api/records/:tableName/:id`

### Submissions
- `POST /api/submissions/submit/:tableName`
- `GET /api/submissions`
- `GET /api/submissions/:id`
- `POST /api/submissions/approve/:id`
- `POST /api/submissions/reject/:id`

### Analytics
- `GET /api/analytics/summary`

## Reference
This project follows current Supabase guidance that Auth uses JWTs, `auth.getUser()` can retrieve the authenticated user, and admin auth methods require a `service_role` key. It also follows Supabase guidance to keep application user data in public tables linked to `auth.users`, and to use Storage for file uploads. citeturn769903search2turn769903search3turn769903search6turn769903search7turn769903search14
