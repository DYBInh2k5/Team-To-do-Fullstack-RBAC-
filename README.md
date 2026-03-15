# Team To-do Fullstack (RBAC)

[![CI](https://github.com/DYBInh2k5/Team-To-do-Fullstack-RBAC-/actions/workflows/ci.yml/badge.svg)](https://github.com/DYBInh2k5/Team-To-do-Fullstack-RBAC-/actions/workflows/ci.yml)

Fullstack project for team task management with role-based access control.

## Features

- JWT authentication (`register`, `login`, `me`)
- Roles: `ADMIN`, `MEMBER`
- First registered account is auto-assigned `ADMIN`
- Task management with assignment, deadline, and status
- Access control:
  - `ADMIN`: create/update/delete tasks, view all tasks, list users for assignment
  - `MEMBER`: view only assigned tasks, update status of assigned tasks
- Request validation with `class-validator`
- Swagger docs at `/docs`
- React dashboard with role-aware UI

## Tech Stack

- Backend: NestJS, Prisma ORM, MySQL, JWT + Passport
- Frontend: React + TypeScript + Vite + Axios

## Project Structure

- `/src`: NestJS backend
- `/frontend`: React frontend
- `/prisma`: Prisma schema and migrations

## Quick Start

1. Install backend dependencies

```bash
npm install
```

2. Configure backend environment in `.env`

```env
PORT=3000
DATABASE_URL="mysql://root:password@localhost:3306/team_todo"
JWT_SECRET="change-this-in-production"
JWT_EXPIRES_IN_SECONDS=86400
```

3. Generate Prisma client and apply migration

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

4. Start backend

```bash
npm run start:dev
```

5. Setup frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173` and talks to backend `http://localhost:3000`.

## Run On Network

### Option A - Same Wi-Fi/LAN (quick demo)

1. Find your PC local IP (example: `192.168.1.10`).
2. Backend `.env`:

```env
PORT=3000
HOST=0.0.0.0
CORS_ORIGINS="http://192.168.1.10:5173"
```

3. Start backend:

```bash
npm run start:dev
```

4. Frontend `.env`:

```env
VITE_API_BASE_URL="http://192.168.1.10:3000"
```

5. Start frontend on all interfaces:

```bash
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

6. Open from another device in the same network:
  - `http://192.168.1.10:5173`

7. If cannot connect, allow ports `3000` and `5173` in Windows Firewall.

### Option B - Public Internet (production)

Recommended split:
- Backend + MySQL: Railway, Render, or VPS Docker
- Frontend: Vercel or Netlify

Required backend env:
- `PORT` from platform
- `HOST=0.0.0.0`
- `DATABASE_URL` to managed MySQL
- `JWT_SECRET` strong secret
- `JWT_EXPIRES_IN_SECONDS=86400`
- `CORS_ORIGINS` set to frontend domain, for example `https://your-app.vercel.app`

Required frontend env:
- `VITE_API_BASE_URL=https://your-backend-domain`

After deploy:
1. Test `GET /docs` on backend domain.
2. Open frontend domain and test register/login.
3. Verify task create/update/delete from both ADMIN and MEMBER accounts.

## Docker One-Command Setup

Run full stack (MySQL + backend + frontend):

```bash
docker compose up --build
```

Services:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

Environment overrides can be passed from shell, for example:

```bash
JWT_SECRET=my-very-strong-secret MYSQL_ROOT_PASSWORD=my-db-pass docker compose up --build
```

## API Overview

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (Bearer token)

### Users

- `GET /users` (ADMIN only)

### Tasks

- `POST /tasks` (ADMIN)
- `GET /tasks` (ADMIN/MEMBER)
- `GET /tasks/:id` (ADMIN/MEMBER with permission)
- `PATCH /tasks/:id` (ADMIN)
- `PATCH /tasks/:id/status` (ADMIN or assigned MEMBER)
- `DELETE /tasks/:id` (ADMIN)

## Scripts

Backend:

```bash
npm run lint
npm run build
npm test
npm run start:dev
npm run test:e2e
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
npm test
npm run dev
```
