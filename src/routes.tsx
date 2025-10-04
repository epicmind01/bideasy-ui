import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import App from './App';
import { useAuth } from './hooks/API/useAuth';
import AuctionList from './pages/Auction/AuctionList';
import CreateAuction from './pages/Auction/CreateAuction';
import AuctionDetail from './pages/Auction/AuctionDetail';
import Profile from './pages/Profile';
import AuctionLive from './pages/Auction/AuctionLive';
import RFQList from './pages/RFQ/RFQList';
import CreateRFQ from './pages/RFQ/CreateRFQ';
import RFQView from './pages/RFQ/RFQView';
import RFQComparison from './pages/RFQ/RFQComparison';
import RFQRounds from './pages/RFQ/RFQRounds';
import RFQRoundDetails from './pages/RFQ/RFQRoundDetails';
import MasterDashboard from './pages/Master/Dashboard';
import ArcReportsList from './pages/ArcReports';
import ArcReportDetail from './pages/ArcReports/ArcReportDetail';
import ContractList from './pages/Contract';
import ContractDetail from './pages/Contract/ContractDetail';
import PurchaseRequestList from './pages/PurchaseRequest';
import CreatePurchaseRequest from './pages/PurchaseRequest/CreatePurchaseRequest';
import EditPurchaseRequest from './pages/PurchaseRequest/EditPurchaseRequest';
import PurchaseRequestView from './pages/PurchaseRequest/PurchaseRequestView';
import PurchaseOrderList from './pages/PurchaseOrder';
import PurchaseOrderView from './pages/PurchaseOrder/PurchaseOrderView';
import EditPurchaseOrder from './pages/PurchaseOrder/EditPurchaseOrder';
import CreateManualPO from './pages/PurchaseOrder/CreateManualPO';
import { GRNList, GRNView, UpdateGRN } from './pages/GRN';
import { ASNList, ASNView } from './pages/ASN';
// Lazy load components
const LoginForm = lazy(() => import('./pages/Auth/Login'));

// Auth wrapper component
// eslint-disable-next-line react-refresh/only-export-components
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {

  const { isAuthenticated } = useAuth();
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
       
        path: 'rfq',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <RFQList />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'rfq/create',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <CreateRFQ />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'rfq/:id',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <RFQView />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'rfq/:id/edit',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Edit RFQ</h1>
                <p className="text-gray-600 mt-2">RFQ edit page - Coming soon</p>
              </div>
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'rfq/:id/comparison',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <RFQComparison />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'rfq/:id/rounds',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <RFQRounds />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'rfq/:id/round/:roundId',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <RFQRoundDetails />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'rfq/:id/vendor/:vendorId',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Vendor Details</h1>
                <p className="text-gray-600 mt-2">Vendor details page - Coming soon</p>
              </div>
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'master',
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
        path: 'arc-reports',
        element: (
          <ProtectedRoute>
            <ArcReportsList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'arc-reports/:id',
        element: (
          <ProtectedRoute>
            <ArcReportDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'contracts',
        element: (
          <ProtectedRoute>
            <ContractList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'contracts/:id',
        element: (
          <ProtectedRoute>
            <ContractDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'contracts/:id/edit',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Edit Contract</h1>
                <p className="text-gray-600 mt-2">Contract edit page - Coming soon</p>
              </div></Suspense>
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
      {
        path: 'purchase-requests',
        element: (
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <PurchaseRequestList />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'purchase-requests/create',
        element: (
          <ProtectedRoute>
            <CreatePurchaseRequest />
          </ProtectedRoute>
        ),
      },
      {
        path: 'purchase-requests/:id',
        element: (
          <ProtectedRoute>
            <PurchaseRequestView />
          </ProtectedRoute>
        ),
      },
      {
        path: 'purchase-requests/:id/edit',
        element: (
          <ProtectedRoute>
            <EditPurchaseRequest />
          </ProtectedRoute>
        ),
      },
      {
        path: 'purchase-order',
        element: (
          <ProtectedRoute>
            <PurchaseOrderList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'purchase-order/:id',
        element: (
          <ProtectedRoute>
            <PurchaseOrderView />
          </ProtectedRoute>
        ),
      },
      {
        path: 'purchase-order/edit/:id',
        element: (
          <ProtectedRoute>
            <EditPurchaseOrder />
          </ProtectedRoute>
        ),
      },
      {
        path: 'purchase-order/create-manual-po',
        element: (
          <ProtectedRoute>
            <CreateManualPO />
          </ProtectedRoute>
        ),
      },
      {
        path: 'grn-list',
        element: (
          <ProtectedRoute>
            <GRNList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'grn-list/:id',
        element: (
          <ProtectedRoute>
            <UpdateGRN />
          </ProtectedRoute>
        ),
      },
      {
        path: 'grn-view/:grnId',
        element: (
          <ProtectedRoute>
            <GRNView />
          </ProtectedRoute>
        ),
      },
      {
        path: 'asn-list',
        element: (
          <ProtectedRoute>
            <ASNList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'asn-list/:id',
        element: (
          <ProtectedRoute>
            <ASNView />
          </ProtectedRoute>
        ),
      },
    ],
  },
  // 404 route
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }  
],
// {
//   basename: '/buyer', // 👈 this is the important part
// }
);
