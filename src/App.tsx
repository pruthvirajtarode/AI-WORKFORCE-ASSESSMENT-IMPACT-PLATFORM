import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/lib/constants';

// Pages
import LandingPage from '@/pages/LandingPage';
import EmployeeLoginPage from '@/pages/EmployeeLoginPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import EmployeeDashboard from '@/pages/employee/EmployeeDashboard';
import AssessmentStartPage from '@/pages/employee/AssessmentStartPage';
import AssessmentPage from '@/pages/employee/AssessmentPage';
import AssessmentResultPage from '@/pages/employee/AssessmentResultPage';
import EmployeeResultsPage from '@/pages/employee/EmployeeResultsPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminEmployeesPage from '@/pages/admin/AdminEmployeesPage';
import AdminEmployeeDetailPage from '@/pages/admin/AdminEmployeeDetailPage';
import AdminSubmissionsPage from '@/pages/admin/AdminSubmissionsPage';
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';
import AdminAssessmentsPage from '@/pages/admin/AdminAssessmentsPage';
import AdminQuestionsPage from '@/pages/admin/AdminQuestionsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import LoadingScreen from '@/components/ui/LoadingScreen';

function ProtectedEmployee({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to={ROUTES.login} replace />;
  return <>{children}</>;
}

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAdmin } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user || !isAdmin) return <Navigate to={ROUTES.adminLogin} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path={ROUTES.home} element={<LandingPage />} />
      <Route path={ROUTES.login} element={<EmployeeLoginPage />} />
      <Route path={ROUTES.adminLogin} element={<AdminLoginPage />} />

      {/* Employee */}
      <Route path={ROUTES.employeeDashboard} element={<ProtectedEmployee><EmployeeDashboard /></ProtectedEmployee>} />
      <Route path={ROUTES.assessmentStart} element={<ProtectedEmployee><AssessmentStartPage /></ProtectedEmployee>} />
      <Route path={ROUTES.assessment} element={<ProtectedEmployee><AssessmentPage /></ProtectedEmployee>} />
      <Route path={ROUTES.assessmentResult} element={<ProtectedEmployee><AssessmentResultPage /></ProtectedEmployee>} />
      <Route path={ROUTES.employeeResults} element={<ProtectedEmployee><EmployeeResultsPage /></ProtectedEmployee>} />

      {/* Admin */}
      <Route path={ROUTES.admin} element={<Navigate to={ROUTES.adminDashboard} replace />} />
      <Route path={ROUTES.adminDashboard} element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
      <Route path={ROUTES.adminEmployees} element={<ProtectedAdmin><AdminEmployeesPage /></ProtectedAdmin>} />
      <Route path={ROUTES.adminEmployee} element={<ProtectedAdmin><AdminEmployeeDetailPage /></ProtectedAdmin>} />
      <Route path={ROUTES.adminSubmissions} element={<ProtectedAdmin><AdminSubmissionsPage /></ProtectedAdmin>} />
      <Route path={ROUTES.adminAnalytics} element={<ProtectedAdmin><AdminAnalyticsPage /></ProtectedAdmin>} />
      <Route path={ROUTES.adminAssessments} element={<ProtectedAdmin><AdminAssessmentsPage /></ProtectedAdmin>} />
      <Route path={ROUTES.adminQuestions} element={<ProtectedAdmin><AdminQuestionsPage /></ProtectedAdmin>} />
      <Route path={ROUTES.adminSettings} element={<ProtectedAdmin><AdminSettingsPage /></ProtectedAdmin>} />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
