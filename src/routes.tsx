import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import App from './App';
import { useAuth } from './hooks/API/useAuth';
// Lazy load components
const LoginForm = lazy(() => import('./pages/Auth/Login'));
const Table = lazy(() => import('./pages/Table'));
const Detail = lazy(() => import('./pages/Detail'));

// Auth wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {

  const { isAuthenticated } = useAuth();

  console.log("isAuthenticated", isAuthenticated());
  if (!isAuthenticated()) {
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
