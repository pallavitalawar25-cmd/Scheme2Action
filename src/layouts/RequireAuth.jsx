import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RouteFallback } from './PageTransition';

// Route guard (demo). role="admin" additionally requires the demo admin account.
export default function RequireAuth({ role }) {
  const { isAuthenticated, isAdmin, status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <RouteFallback />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />;
  if (role === 'admin' && !isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
