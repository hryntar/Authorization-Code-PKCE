import type { ReactNode } from 'react';
import { useCurrentUser, useLogout, useSetAuthUser } from '../hooks/useAuth';
import { AuthContext } from './auth.context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user = null, isLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const setAuthUser = useSetAuthUser();

  const login = setAuthUser;
  const logout = () => logoutMutation.mutate();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
