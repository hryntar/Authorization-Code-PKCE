import { createContext, useContext } from 'react';
import type { AuthUser, AuthState } from '../types/auth.types';

export interface AuthContextValue extends AuthState {
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}
