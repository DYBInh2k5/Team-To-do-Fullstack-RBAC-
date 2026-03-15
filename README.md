# Team To-do Fullstack (RBAC)

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
