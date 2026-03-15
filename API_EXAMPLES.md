# API Examples

## 1) Register first account (auto ADMIN)

POST /auth/register

Body:
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "123456"
}

## 2) Login

POST /auth/login

Body:
{
  "email": "admin@example.com",
  "password": "123456"
}

Response includes accessToken.

## 3) Create member account

POST /auth/register

Body:
{
  "name": "Member User",
  "email": "member@example.com",
  "password": "123456"
}

## 4) Create task (ADMIN)

POST /tasks
Authorization: Bearer <accessToken>

Body:
{
  "title": "Prepare sprint report",
  "description": "Collect updates from team",
  "deadline": "2026-03-20T23:59:59.000Z",
  "assigneeId": 2
}

## 5) Member updates task status

PATCH /tasks/1/status
Authorization: Bearer <memberToken>

Body:
{
  "status": "IN_PROGRESS"
}

## 6) Admin list users for assignment

GET /users
Authorization: Bearer <adminToken>

## 7) List tasks

GET /tasks
Authorization: Bearer <token>

- ADMIN sees all tasks.
- MEMBER sees only assigned tasks.
