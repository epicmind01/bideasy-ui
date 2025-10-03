import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import App from './App';
import { useAuth } from './hooks/API/useAuth';
import MasterDashboard from './pages/Master/Dashboard';
import AuctionList from './pages/Auction/AuctionList';
import CreateAuction from './pages/Auction/CreateAuction';
import AuctionDetail from './pages/Auction/AuctionDetail';
import Profile from './pages/Profile';
import AuctionLive from './pages/Auction/AuctionLive';
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
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'auction',
        element: (
          <ProtectedRoute>
            <AuctionList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'auction/create',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <CreateAuction />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'auction/:id/edit',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <CreateAuction />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'auction/:id/live',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <AuctionLive />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'auction/:id',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <AuctionDetail />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'master',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <MasterDashboard />
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
