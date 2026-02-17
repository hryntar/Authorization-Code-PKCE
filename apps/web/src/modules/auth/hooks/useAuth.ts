import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCurrentUser, logoutFromServer } from '../api/auth.api';
import type { AuthUser } from '../types/auth.types';
import { saveUser, removeUser } from '../utils';

export const authKeys = {
  user: ['auth', 'user'] as const,
};

export function useCurrentUser() {
  return useQuery<AuthUser>({
    queryKey: authKeys.user,
    queryFn: fetchCurrentUser,
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutFromServer,
    onSuccess: () => {
      removeUser();
      queryClient.setQueryData(authKeys.user, null);
    },
    onError: error => {
      console.error('[Auth] Logout failed', error);
      removeUser();
      queryClient.setQueryData(authKeys.user, null);
    },
  });
}

export function useSetAuthUser() {
  const queryClient = useQueryClient();

  return (user: AuthUser) => {
    saveUser(user);
    queryClient.setQueryData(authKeys.user, user);
  };
}
