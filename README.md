# StaffSync — HR Management System

A MERN-stack starter project for employee, attendance, leave, and announcement management.

## Features
- Responsive dashboard with summary cards and sidebar navigation
- Employee directory with search
- Leave requests and approval status UI
- Attendance records
- Company announcements
- Express REST API with MongoDB models
- JWT authentication endpoints and password hashing
- Demo-friendly seeded sample data in the frontend

## Requirements
Node.js 18+ and MongoDB (local or Atlas).

## Run locally
1. Install dependencies:
   ```bash
   npm install
   npm run install:all
   ```
2. Create `server/.env` from `server/.env.example` and set `MONGO_URI` and `JWT_SECRET`.
3. Start MongoDB, then run:
   ```bash
   npm run dev
   ```
4. Open the Vite URL printed in the terminal (usually http://localhost:5173).

The UI runs with sample data; the API is available at http://localhost:5000/api.
To connect the UI to persistent API data, use the endpoints documented below.

## API
- `GET /api/health`
- `POST /api/auth/register` — `{ name, email, password, role? }`
- `POST /api/auth/login` — `{ email, password }`
- `GET /api/employees` — JWT required
- `POST /api/employees` — JWT required
- `GET /api/leaves` — JWT required
- `POST /api/leaves` — JWT required
- `PATCH /api/leaves/:id` — JWT required
- `GET /api/attendance` — JWT required
- `POST /api/attendance` — JWT required
- `GET /api/announcements` — JWT required
- `POST /api/announcements` — JWT required

## Publish links for SkillWallet
- **GitHub:** create a public repository named `StaffSync`, upload this folder, and copy the repository URL.
- **Demo:** deploy the frontend to Vercel or Netlify and the API to Render/Railway; set `VITE_API_URL` in the frontend deployment and `MONGO_URI`/`JWT_SECRET` in the backend environment.
- Do not paste a local `localhost` link into SkillWallet; mentors cannot access your computer from that link.
