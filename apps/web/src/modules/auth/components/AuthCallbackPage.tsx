import { useEffect } from 'react';

export function AuthCallbackPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (window.opener) {
      if (error) {
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_CALLBACK', error: errorDescription || error },
          window.location.origin
        );
      } else if (code) {
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_CALLBACK', code, state },
          window.location.origin
        );
      } else {
        window.opener.postMessage(
          { type: 'GOOGLE_AUTH_CALLBACK', error: 'No authorization code received' },
          window.location.origin
        );
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Processing...</p>
    </div>
  );
}
