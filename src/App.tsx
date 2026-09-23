import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';

// Product App Pages
import { OverviewPage } from './pages/app/OverviewPage';
import { NewAnalysisPage } from './pages/app/NewAnalysisPage';
import { AnalysisDetailPage } from './pages/app/AnalysisDetailPage';
import { AnalysesListPage } from './pages/app/AnalysesListPage';
import { RoutesDirectoryPage } from './pages/app/RoutesDirectoryPage';
import { SettingsPage } from './pages/app/SettingsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { DataHealthPage } from './pages/admin/DataHealthPage';
import { ModelPerformancePage } from './pages/admin/ModelPerformancePage';
import { UsersPage } from './pages/admin/UsersPage';
import { UsagePage } from './pages/admin/UsagePage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes cache
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Website Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Authenticated Commercial Freight Application */}
            <Route
              path="/app"
              element={
                <ProtectedRoute requiredRole="User">
                  <ErrorBoundary>
                    <AppLayout />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            >
              <Route index element={<OverviewPage />} />
              <Route path="analysis/new" element={<NewAnalysisPage />} />
              <Route path="analysis/:id" element={<AnalysisDetailPage />} />
              <Route path="analyses/:id" element={<AnalysisDetailPage />} />
              <Route path="analyses" element={<AnalysesListPage />} />
              <Route path="routes" element={<RoutesDirectoryPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Administrative Management Portal */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="data-health" element={<DataHealthPage />} />
              <Route path="model-performance" element={<ModelPerformancePage />} />
              <Route path="usage" element={<UsagePage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
