import axios from 'axios';
import { getToken } from './storage';
import type {
  AuthResponse,
  CreateTaskPayload,
  Task,
  TaskStatus,
  User,
} from '../types';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AuthPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthPayload {
  name: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', payload);
  return response.data;
}

export async function login(payload: AuthPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', payload);
  return response.data;
}

export async function getProfile(): Promise<User> {
  const response = await api.get<User>('/auth/me');
  return response.data;
}

export async function getTasks(): Promise<Task[]> {
  const response = await api.get<Task[]>('/tasks');
  return response.data;
}

export async function getUsers(): Promise<User[]> {
  const response = await api.get<User[]>('/users');
  return response.data;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const response = await api.post<Task>('/tasks', payload);
  return response.data;
}

export async function updateTaskStatus(
  taskId: number,
  status: TaskStatus,
): Promise<Task> {
  const response = await api.patch<Task>(`/tasks/${taskId}/status`, { status });
  return response.data;
}

export async function deleteTask(taskId: number): Promise<void> {
  await api.delete(`/tasks/${taskId}`);
}
