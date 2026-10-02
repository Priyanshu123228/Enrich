import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-600 animate-spin mb-2" />
        <p className="text-sm text-stone-500">Verifying authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to /login while storing the current location for post-login redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
