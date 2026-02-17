// Components
export { LoginPage, DashboardPage, AuthCallbackPage } from './components';

// Hooks
export { useGoogleAuth, useCurrentUser, useLogout, useSetAuthUser, authKeys } from './hooks';

// Types
export type { AuthUser, AuthState, AuthResponse, PKCEChallenge } from './types/auth.types';

// API
export { exchangeCodeForToken, fetchCurrentUser } from './api';

// Store
export { AuthProvider, useAuthContext } from './stores';

// Utils
export {
  generatePKCEChallenge,
  storePKCEVerifier,
  retrievePKCEVerifier,
  clearPKCEVerifier,
  generateOAuthState,
  storeOAuthState,
  validateAndClearOAuthState,
  saveUser,
  getUser,
  removeUser,
} from './utils';
