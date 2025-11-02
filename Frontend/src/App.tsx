import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@/contexts/AuthContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Layout from '@/components/layout/Layout';
import Loading from '@/components/common/Loading';
import 'react-toastify/dist/ReactToastify.css';

// Lazy load pages for code splitting
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const UserDashboard = lazy(() => import('@/pages/dashboard/UserDashboard'));
const AdminDashboard = lazy(() => import('@/pages/dashboard/AdminDashboard'));
const InvestmentList = lazy(() => import('@/pages/investments/InvestmentList'));
const InvestmentForm = lazy(() => import('@/pages/investments/InvestmentForm'));
const InvestmentDetail = lazy(() => import('@/pages/investments/InvestmentDetail'));
const TransactionList = lazy(() => import('@/pages/transactions/TransactionList'));
const TransactionForm = lazy(() => import('@/pages/transactions/TransactionForm'));
const Reports = lazy(() => import('@/pages/reports/Reports'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const ActivityLog = lazy(() => import('@/pages/admin/ActivityLog'));
const Profile = lazy(() => import('@/pages/profile/Profile'));

import { ROUTES } from '@/utils/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route
                path={ROUTES.LOGIN}
                element={
                  <Suspense fallback={<Loading fullScreen />}>
                    <Login />
                  </Suspense>
                }
              />
              <Route
                path={ROUTES.REGISTER}
                element={
                  <Suspense fallback={<Loading fullScreen />}>
                    <Register />
                  </Suspense>
                }
              />
              <Route
                path={ROUTES.FORGOT_PASSWORD}
                element={
                  <Suspense fallback={<Loading fullScreen />}>
                    <ForgotPassword />
                  </Suspense>
                }
              />
              <Route
                path={ROUTES.RESET_PASSWORD}
                element={
                  <Suspense fallback={<Loading fullScreen />}>
                    <ResetPassword />
                  </Suspense>
                }
              />

              {/* Protected Routes */}
              <Route
                path={ROUTES.DASHBOARD}
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<Loading fullScreen />}>
                        <UserDashboard />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path={ROUTES.ADMIN_DASHBOARD}
                element={
                  <ProtectedRoute requireAdmin>
                    <Layout>
                      <Suspense fallback={<Loading fullScreen />}>
                        <AdminDashboard />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_USERS}
                element={
                  <ProtectedRoute requireAdmin>
                    <Layout>
                      <Suspense fallback={<Loading fullScreen />}>
                        <UserManagement />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_ACTIVITY}
                element={
                  <ProtectedRoute requireAdmin>
                    <Layout>
                      <Suspense fallback={<Loading fullScreen />}>
                        <ActivityLog />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Investment Routes */}
              <Route
                path={ROUTES.INVESTMENTS}
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<Loading fullScreen />}>
                        <InvestmentList />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.INVESTMENT_FORM}
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<Loading fullScreen />}>
                        <InvestmentForm />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/investments/:id"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<Loading fullScreen />}>
                        <InvestmentDetail />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/investments/:id/edit"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<Loading fullScreen />}>
                        <InvestmentForm />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Transaction Routes */}
              <Route
                path={ROUTES.TRANSACTIONS}
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<Loading fullScreen />}>
                        <TransactionList />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.TRANSACTION_FORM}
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<Loading fullScreen />}>
                        <TransactionForm />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Report Routes */}
              <Route
                path={ROUTES.REPORTS}
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<Loading fullScreen />}>
                        <Reports />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Profile Route */}
              <Route
                path={ROUTES.PROFILE}
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<Loading fullScreen />}>
                        <Profile />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
              <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            </Routes>
          </BrowserRouter>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
