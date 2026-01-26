import { ComponentExample } from '@components/component-example';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';

export function App() {
  const [backendResponse, setBackendResponse] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(import.meta.env.VITE_PUBLIC_API_URL)
      .then(res => res.text())
      .then(data => {
        setBackendResponse(data);
        setLoading(false);
      })
      .catch(err => {
        setBackendResponse('Error connecting to backend: ' + err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen">
      <div className="flex flex-col items-center justify-center pt-20 px-4">
        <h1 className="text-6xl font-bold text-center mb-6">Welcome to Viso Academy!</h1>

        <Card>
          <CardHeader>
            <CardTitle>Backend Test:</CardTitle>
          </CardHeader>
          {loading ? (
            <CardContent>Loading...</CardContent>
          ) : (
            <CardContent className="text-lg text-green-600 font-medium">
              {backendResponse}
            </CardContent>
          )}
        </Card>
      </div>

      <ComponentExample />
    </div>
  );
}

export default App;
