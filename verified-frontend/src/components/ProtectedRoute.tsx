import { Navigate, Outlet } from 'react-router-dom';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  role: UserRole | null;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({
  isAuthenticated,
  role,
  requiredRole,
}: ProtectedRouteProps) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole && role !== UserRole.ADMIN) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
