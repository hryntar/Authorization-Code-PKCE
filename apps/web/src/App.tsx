import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/shared/api';
import { AuthProvider } from '@/modules/auth';
import { AppRouter } from './router';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
