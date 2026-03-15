export type Role = 'ADMIN' | 'MEMBER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface TaskUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  deadline: string;
  status: TaskStatus;
  assigneeId: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  assignee: TaskUser;
  createdBy: TaskUser;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  deadline: string;
  assigneeId: number;
}
