import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { lazy, Suspense } from 'react';
import App from './App';

// Lazy load components
const LoginForm = lazy(() => import('./pages/Auth/Login'));
const Table = lazy(() => import('./pages/Table'));
const Detail = lazy(() => import('./pages/Detail'));

// Auth wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, isChecking } = useAuth();

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Routes configuration
export const router = createBrowserRouter([
  // Public route - Login
  {
    path: '/login',
    element: (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    ),
  },
  // Protected routes
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <Table />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'detail/:id',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <Detail />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
  // 404 route
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
