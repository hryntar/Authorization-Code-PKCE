import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  generatePKCEChallenge,
  storePKCEVerifier,
  retrievePKCEVerifier,
  clearPKCEVerifier,
  generateOAuthState,
  storeOAuthState,
  validateAndClearOAuthState,
} from '../utils/pkce';
import { exchangeCodeForToken } from '../api/auth.api';
import { useAuthContext } from '../stores/auth.context';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = 'http://localhost:5173/auth/callback';

function buildAuthorizationUrl(codeChallenge: string, state: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid profile email',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    login_hint: 'hrynchuktt@gmail.com',
    prompt: 'select_account consent',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function useGoogleAuth() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'GOOGLE_AUTH_CALLBACK') return;

      if (popupRef.current && !popupRef.current.closed) {
        popupRef.current.close();
      }

      if (event.data.error) {
        console.error('[Auth] Error from popup:', event.data.error);
        setError(event.data.error);
        return;
      }

      const code = event.data.code as string;
      const state = event.data.state as string | undefined;

      if (!state || !validateAndClearOAuthState(state)) {
        console.error('[Auth] State mismatch — possible CSRF attack');
        setError('Security validation failed. Please try again.');
        return;
      }

      setIsLoggingIn(true);
      setError(null);

      try {
        const codeVerifier = retrievePKCEVerifier();

        const result = await exchangeCodeForToken({
          code,
          codeVerifier: codeVerifier || undefined,
        });

        clearPKCEVerifier();
        login(result.user);

        console.log('[Auth] Login complete, redirecting...');
        navigate('/dashboard');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Authentication failed';
        console.error('[Auth] Error:', message);
        setError(message);
        clearPKCEVerifier();
      } finally {
        setIsLoggingIn(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [login, navigate]);

  const startLogin = useCallback(async () => {
    setError(null);

    const { codeVerifier, codeChallenge } = await generatePKCEChallenge();
    storePKCEVerifier(codeVerifier);

    const state = generateOAuthState();
    storeOAuthState(state);

    const authUrl = buildAuthorizationUrl(codeChallenge, state);

    popupRef.current = window.open(authUrl, 'google-oauth');

    if (!popupRef.current) {
      setError('Popup blocked. Please allow popups for this site.');
    }
  }, []);

  return { startLogin, isLoggingIn, error };
}
