import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './hooks';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClaimsListPage from './pages/ClaimsListPage';
import SubmitClaimPage from './pages/SubmitClaimPage';
import ClaimResultPage from './pages/ClaimResultPage';
import ClaimDetailPage from './pages/ClaimDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Inner component so useAuth runs inside QueryClientProvider
function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — any authenticated user */}
        <Route
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} role={role} />
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/claims" element={<ClaimsListPage />} />
          <Route path="/claims/new" element={<SubmitClaimPage />} />
          <Route path="/claims/:id/result" element={<ClaimResultPage />} />
          <Route path="/claims/:id" element={<ClaimDetailPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  );
};

export default App;
