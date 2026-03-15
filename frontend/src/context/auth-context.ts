import { createContext } from 'react';
import type { AuthPayload, RegisterPayload } from '../lib/api';
import type { User } from '../types';

export interface AuthContextValue {
  user: User | null;
  isBootstrapping: boolean;
  login: (payload: AuthPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
