import { apiClient } from '@/shared/api';
import type { AuthResponse, AuthUser, GoogleCallbackPayload } from '../types/auth.types';

export async function exchangeCodeForToken(payload: GoogleCallbackPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/google/callback', payload);
  return data;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await apiClient.get<{ user: AuthUser }>('/auth/me');
  return data.user;
}

export async function logoutFromServer(): Promise<void> {
  await apiClient.post('/auth/logout');
}
