import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  saveSession,
  getToken,
  getStoredUser,
  clearSession,
} from '../lib/storage';
import type { User } from '../types';

const mockUser: User = {
  id: 1,
  email: 'admin@demo.com',
  name: 'Alice Admin',
  role: 'ADMIN',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('storage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('saveSession', () => {
    it('should persist token and user in localStorage', () => {
      saveSession('my-token', mockUser);

      expect(localStorage.getItem('teamtodo_token')).toBe('my-token');
      expect(localStorage.getItem('teamtodo_user')).toBe(
        JSON.stringify(mockUser),
      );
    });
  });

  describe('getToken', () => {
    it('should return null when no token is stored', () => {
      expect(getToken()).toBeNull();
    });

    it('should return the stored token', () => {
      saveSession('abc123', mockUser);
      expect(getToken()).toBe('abc123');
    });
  });

  describe('getStoredUser', () => {
    it('should return null when nothing is stored', () => {
      expect(getStoredUser()).toBeNull();
    });

    it('should return the stored user object', () => {
      saveSession('token', mockUser);
      expect(getStoredUser()).toEqual(mockUser);
    });

    it('should return null for malformed JSON', () => {
      localStorage.setItem('teamtodo_user', '{broken json');
      expect(getStoredUser()).toBeNull();
    });
  });

  describe('clearSession', () => {
    it('should remove token and user from localStorage', () => {
      saveSession('token', mockUser);
      clearSession();

      expect(getToken()).toBeNull();
      expect(getStoredUser()).toBeNull();
    });
  });
});
