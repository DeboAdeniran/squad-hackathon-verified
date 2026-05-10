import { Navigate, Outlet } from 'react-router-dom';
import { TOKEN_KEY } from '../constants';

interface ProtectedRouteProps {
  /** If provided, user must have this role to access the route */
  requiredRole?: string;
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const role = sessionStorage.getItem('verified_user_role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole && role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;