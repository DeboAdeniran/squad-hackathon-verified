import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, role } = useAuth();

  // Not logged in — send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role — send to dashboard
  if (requiredRole && role !== requiredRole && role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
