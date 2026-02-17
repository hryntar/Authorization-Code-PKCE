export function generateCodeVerifier(length = 128): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return base64UrlEncode(array).slice(0, length);
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

export async function generatePKCEChallenge() {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  console.log('[PKCE] Challenge pair generated');
  return { codeVerifier, codeChallenge };
}

function base64UrlEncode(buffer: Uint8Array): string {
  let str = '';
  buffer.forEach(byte => {
    str += String.fromCharCode(byte);
  });
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const PKCE_STORAGE_KEY = 'oauth_pkce_code_verifier';
const STATE_STORAGE_KEY = 'oauth_state';

export function storePKCEVerifier(codeVerifier: string): void {
  sessionStorage.setItem(PKCE_STORAGE_KEY, codeVerifier);
}

export function retrievePKCEVerifier(): string | null {
  return sessionStorage.getItem(PKCE_STORAGE_KEY);
}

export function clearPKCEVerifier(): void {
  sessionStorage.removeItem(PKCE_STORAGE_KEY);
}

export function generateOAuthState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

export function storeOAuthState(state: string): void {
  sessionStorage.setItem(STATE_STORAGE_KEY, state);
}

export function validateAndClearOAuthState(returnedState: string): boolean {
  const stored = sessionStorage.getItem(STATE_STORAGE_KEY);
  sessionStorage.removeItem(STATE_STORAGE_KEY);
  return stored !== null && stored === returnedState;
}
