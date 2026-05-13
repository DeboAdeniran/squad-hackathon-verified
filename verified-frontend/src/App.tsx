import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public — no sidebar */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected — ProtectedRoute redirects to /login if not authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/claims" element={<ClaimsListPage />} />
              {/* /claims/new must come before /claims/:id so it isn't swallowed */}
              <Route path="/claims/new" element={<SubmitClaimPage />} />
              <Route path="/claims/:id/result" element={<ClaimResultPage />} />
              <Route path="/claims/:id" element={<ClaimDetailPage />} />
            </Route>
          </Route>

          {/* Fallback — unauthenticated users are caught by ProtectedRoute */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
