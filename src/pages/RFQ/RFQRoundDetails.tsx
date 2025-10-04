import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import PageHeader from '../../components/ui/page-header/PageHeader';
import { DataTable } from '../../components/ui/data-table/DataTable';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { 
  useGetRFQDetailsApi,
  useGetRFQRoundDetailsApi,
  useGetRFQRoundVendorsApi,
  useUpdateRFQRoundApi,
  useCloseRFQRoundApi
} from '../../hooks/API/RFQApi';
import { 
  Play, 
  Square, 
  Clock, 
  Users, 
  TrendingUp,
  FileText,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RoundVendor {
  id: string;
  vendorId: string;
  vendor: {
    id: string;
    companyName: string;
    vendorCode: string;
    email: string;
  };
  status: 'PENDING' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'COUNTER_OFFER';
  submittedAt?: string;
  totalAmount: number;
  itemCount: number;
  round: number;
  rank: number;
  preferedVendor: number;
  lastModified: string;
}


const RFQRoundDetails: React.FC = () => {
  const { id, roundId } = useParams<{ id: string; roundId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'items' | 'analytics'>('overview');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // API hooks
  const { data: rfqDetails, isLoading: isLoadingDetails } = useGetRFQDetailsApi(id!);
  const { data: roundDetails, isLoading: isLoadingRound } = useGetRFQRoundDetailsApi(roundId!);
  const { data: vendorsData, isLoading: isLoadingVendors, refetch } = useGetRFQRoundVendorsApi(roundId!);
  const updateRound = useUpdateRFQRoundApi();
  const closeRound = useCloseRFQRoundApi();

  // Vendor columns
  const vendorColumns: ColumnDef<RoundVendor>[] = [
    {
      accessorKey: 'vendor',
      header: 'Vendor',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {row.original.vendor?.companyName?.charAt(0) || 'V'}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {row.original.vendor?.companyName || 'N/A'}
            </div>
            <div className="text-sm text-gray-500">
              {row.original.vendor?.vendorCode || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusConfig = {
          'PENDING': { color: 'warning', text: 'Pending', icon: Clock },
          'SUBMITTED': { color: 'info', text: 'Submitted', icon: CheckCircle },
          'ACCEPTED': { color: 'success', text: 'Accepted', icon: CheckCircle },
          'REJECTED': { color: 'error', text: 'Rejected', icon: XCircle },
          'COUNTER_OFFER': { color: 'primary', text: 'Counter Offer', icon: Send },
        }[status] || { color: 'primary', text: status, icon: AlertCircle };

        const Icon = statusConfig.icon;

        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            <Badge variant="light" color={statusConfig.color as any} size="sm">
              {statusConfig.text}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">
          ₹{row.original.totalAmount?.toLocaleString() || '0'}
        </span>
      ),
    },
    {
      accessorKey: 'itemCount',
      header: 'Items',
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.original.itemCount || 0}
        </span>
      ),
    },
    {
      accessorKey: 'rank',
      header: 'Rank',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          #{row.original.rank || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'preferedVendor',
      header: 'Priority',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          P{row.original.preferedVendor || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'submittedAt',
      header: 'Submitted At',
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.original.submittedAt 
            ? format(new Date(row.original.submittedAt), 'MMM dd, yyyy HH:mm')
            : 'Not submitted'
          }
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/rfq/${id}/vendor/${row.original.vendorId}?round=${roundId}`)}
            className="p-1.5"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/rfq/${id}/comparison?vendor=${row.original.vendorId}&round=${roundId}`)}
            className="p-1.5"
            title="View Comparison"
          >
            <TrendingUp className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Handle round actions
  const handleStartRound = async () => {
    try {
      await updateRound.mutateAsync({
        roundId: roundId!,
        status: 'ACTIVE',
      });
      toast.success('Round started successfully!');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to start round.');
    }
  };

  const handleCloseRound = async () => {
    try {
      await closeRound.mutateAsync(roundId!);
      toast.success('Round closed successfully!');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to close round.');
    }
  };

  const handleSendReminder = async () => {
    // TODO: Implement send reminder functionality
    toast.success('Reminder sent to all vendors!');
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Data refreshed!');
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      pageIndex: page - 1
    }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize,
      pageIndex: 0
    }));
  };

  if (isLoadingDetails || isLoadingRound) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!rfqDetails || !roundDetails) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Round Not Found</h3>
        <p className="text-gray-500 mb-4">The requested round could not be found.</p>
        <Button onClick={() => navigate(`/rfq/${id}/rounds`)}>
          Back to Rounds
        </Button>
      </div>
    );
  }

  const vendors = vendorsData || [];
  const submittedVendors = vendors.filter(v => v.status === 'SUBMITTED');
  const pendingVendors = vendors.filter(v => v.status === 'PENDING');
  const isActive = roundDetails.status === 'ACTIVE';
  const isDraft = roundDetails.status === 'DRAFT';
  const isClosed = roundDetails.status === 'CLOSED';

  return (
    <div className="p-6">
      <PageHeader 
        title={`Round ${roundDetails.roundNumber} Details`}
        subtitle={`${rfqDetails.eventCode} - ${rfqDetails.title}`}
        showBackButton={true}
        backButtonUrl={`/rfq/${id}/rounds`}
      >
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          {isDraft && (
            <Button 
              size="sm" 
              variant="primary"
              onClick={handleStartRound}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Round
            </Button>
          )}
          
          {isActive && (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleSendReminder}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Reminder
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleCloseRound}
                className="text-orange-600 hover:text-orange-700"
              >
                <Square className="h-4 w-4 mr-2" />
                Close Round
              </Button>
            </>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate(`/rfq/${id}/round/${roundId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Round
          </Button>
        </div>
      </PageHeader>

      {/* Round Status Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="light" 
                  color={
                    isActive ? 'success' : 
                    isDraft ? 'warning' : 
                    isClosed ? 'info' : 'primary'
                  } 
                  size="sm"
                >
                  {roundDetails.status}
                </Badge>
                {isActive && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">Round {roundDetails.roundNumber}</h3>
                <p className="text-sm text-gray-600">{roundDetails.description || 'No description'}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Round Duration</div>
              <div className="font-medium">
                {format(new Date(roundDetails.startDate), 'MMM dd')} - {format(new Date(roundDetails.endDate), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{vendors.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Responded</p>
                <p className="text-2xl font-bold text-green-600">{submittedVendors.length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{pendingVendors.length}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Best Price</p>
                <p className="text-2xl font-bold text-green-600">₹{roundDetails.bestPrice?.toLocaleString() || '0'}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: FileText },
              { id: 'vendors', name: 'Vendors', icon: Users },
              { id: 'items', name: 'Items', icon: FileText },
              { id: 'analytics', name: 'Analytics', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Round Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900">{roundDetails.description || 'No description provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Start Date</label>
                  <p className="text-gray-900">
                    {format(new Date(roundDetails.startDate), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">End Date</label>
                  <p className="text-gray-900">
                    {format(new Date(roundDetails.endDate), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-gray-900">
                    {format(new Date(roundDetails.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Round Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Average Price</span>
                  <span className="font-medium">₹{roundDetails.averagePrice?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Best Price</span>
                  <span className="font-medium text-green-600">₹{roundDetails.bestPrice?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Total Savings</span>
                  <span className="font-medium text-green-600">₹{roundDetails.savings?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Savings %</span>
                  <span className="font-medium text-green-600">{roundDetails.savingsPercentage?.toFixed(1) || '0'}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'vendors' && (
          <Card>
            <CardHeader>
              <CardTitle>Vendor Responses</CardTitle>
              <p className="text-sm text-gray-600">
                {submittedVendors.length} of {vendors.length} vendors have responded
              </p>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={vendorColumns}
                data={vendors || []}
                totalItems={vendors.length}
                isLoading={isLoadingVendors}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSize={pagination.pageSize}
                currentPage={pagination.pageIndex + 1}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'items' && (
          <Card>
            <CardHeader>
              <CardTitle>Round Items</CardTitle>
              <p className="text-sm text-gray-600">
                Items included in this round
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Items data will be displayed here
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'analytics' && (
          <Card>
            <CardHeader>
              <CardTitle>Round Analytics</CardTitle>
              <p className="text-sm text-gray-600">
                Performance metrics and insights
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Analytics charts and insights will be displayed here
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RFQRoundDetails;
