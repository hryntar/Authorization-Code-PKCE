import { useAuthContext } from '../stores/auth.context';
import { Navigate } from 'react-router';

export function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
        {user?.picture && (
          <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-full mx-auto mb-4" />
        )}
        <h2 className="text-xl font-bold">{user?.name}</h2>
        <p className="text-gray-500 mb-6">{user?.email}</p>

        <button
          onClick={logout}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
