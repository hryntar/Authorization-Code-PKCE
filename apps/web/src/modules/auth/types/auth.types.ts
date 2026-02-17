export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface GoogleCallbackPayload {
  code: string;
  codeVerifier?: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface PKCEChallenge {
  codeVerifier: string;
  codeChallenge: string;
}
