import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Sends signed-out visitors to the login page, then back here after.
// Someone who just logged out goes home instead.
export function RequireAuth({ children }) {
  const { user, status, loggedOut } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <p className="page-status">Loading your calendar…</p>;
  if (!user && loggedOut) return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
