# Project Tracking - Team To-do Fullstack

## Objective

Build a team task management system with:
- Task creation and assignment
- Deadline and status tracking
- Role-based access (`ADMIN`, `MEMBER`)
- Standard REST APIs with authentication
- Frontend dashboard integrated with backend APIs

## Current Status

- [x] NestJS backend scaffolded
- [x] Prisma + MySQL schema implemented
- [x] JWT auth (`register`, `login`, `me`)
- [x] Role guards (`ADMIN`, `MEMBER`)
- [x] Task APIs with RBAC
- [x] Users API (`GET /users`) for admin assignment flow
- [x] Swagger docs enabled (`/docs`)
- [x] React frontend scaffolded in `/frontend`
- [x] Auth UI (login/register)
- [x] Dashboard UI by role (admin/member)
- [x] Task status update flow on UI
- [x] Admin task creation and assignment flow on UI
- [x] Backend lint/build pass
- [x] Frontend lint/build pass
- [x] Demo seed script added (`prisma/seed.ts`)
- [x] Backend unit tests added (auth/tasks/roles guard)
- [x] Frontend Vitest tests added (AuthPage/TaskBoard/storage)
- [x] Docker one-command setup added (`docker-compose.yml`)

## Core Modules

Backend:
- `auth`: registration, login, profile, JWT strategy, guards
- `users`: user data access + admin listing endpoint
- `tasks`: create/list/detail/update/status/delete with permissions
- `prisma`: DB client service

Frontend:
- `context`: auth provider and session bootstrap
- `lib`: API client and local storage session helpers
- `pages`: Auth page and Dashboard page
- `components`: Task board cards/actions

## Next Steps

- [ ] Run migration on local MySQL (`npx prisma migrate dev --name init`) if database is not initialized yet
- [ ] Add CI workflow (lint + tests + build)
- [ ] Optional: add more e2e coverage for auth/task flows

## Completion Snapshot

- Backend test suites: `4 passed`
- Frontend test files: `3 passed`
- Backend lint/build: passed
- Frontend lint/build: passed
