import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, isBootstrapping, role } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-[#F4F0E7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#CF4232] border-t-transparent animate-spin" />
          <span className="font-mono text-xs text-[#9B9487] uppercase tracking-widest">
            Verifying session…
          </span>
        </div>
      </div>
    );
  }

  // Cookie missing or expired — send to login
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
