import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import PageHeader from '../../components/ui/page-header/PageHeader';
import { DataTable } from '../../components/ui/data-table/DataTableFixed';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { 
  useGetRFQDetailsApi,
  useGetRFQRoundsApi,
  useCreateRFQRoundApi,
  useUpdateRFQRoundApi,
  useCloseRFQRoundApi
} from '../../hooks/API/RFQApi';
import { 
  Plus, 
  Play, 
  Square, 
  Users, 
  TrendingUp,
  FileText,
  Eye,
  Edit
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface RFQRound {
  id: string;
  roundNumber: number;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  description?: string;
  vendorCount: number;
  totalOffers: number;
  averagePrice: number;
  bestPrice: number;
  savings: number;
  savingsPercentage: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateRoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { description: string; endDate: string }) => void;
  isLoading: boolean;
}

const CreateRoundModal: React.FC<CreateRoundModalProps> = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [description, setDescription] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !endDate) {
      toast.error('Please fill in all required fields.');
      return;
    }
    onSubmit({ description, endDate });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create New Round</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter round description..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Round'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RFQRounds: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // API hooks
  const { data: rfqDetails, isLoading: isLoadingDetails } = useGetRFQDetailsApi(id!);
  const { data: roundsData, isLoading: isLoadingRounds, refetch } = useGetRFQRoundsApi(id!);
  const createRound = useCreateRFQRoundApi();
  const updateRound = useUpdateRFQRoundApi();
  const closeRound = useCloseRFQRoundApi();

  // Columns for rounds table
  const columns: ColumnDef<RFQRound>[] = [
    {
      accessorKey: 'roundNumber',
      header: 'Round',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">Round {row.original.roundNumber}</span>
          {row.original.status === 'ACTIVE' && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusConfig = {
          'DRAFT': { color: 'warning', text: 'Draft' },
          'ACTIVE': { color: 'success', text: 'Active' },
          'CLOSED': { color: 'info', text: 'Closed' },
          'CANCELLED': { color: 'error', text: 'Cancelled' },
        }[status] || { color: 'primary', text: status };

        return (
          <Badge variant="light" color={statusConfig.color as any} size="sm">
            {statusConfig.text}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 truncate" title={row.original.description}>
            {row.original.description || 'No description'}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'vendorCount',
      header: 'Vendors',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span>{row.original.vendorCount}</span>
        </div>
      ),
    },
    {
      accessorKey: 'totalOffers',
      header: 'Offers',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4 text-gray-400" />
          <span>{row.original.totalOffers}</span>
        </div>
      ),
    },
    {
      accessorKey: 'averagePrice',
      header: 'Avg. Price',
      cell: ({ row }) => (
        <span className="font-medium">
          ₹{row.original.averagePrice?.toLocaleString() || '0'}
        </span>
      ),
    },
    {
      accessorKey: 'bestPrice',
      header: 'Best Price',
      cell: ({ row }) => (
        <span className="font-medium text-green-600">
          ₹{row.original.bestPrice?.toLocaleString() || '0'}
        </span>
      ),
    },
    {
      accessorKey: 'savings',
      header: 'Savings',
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium text-green-600">
            ₹{row.original.savings?.toLocaleString() || '0'}
          </div>
          <div className="text-xs text-gray-500">
            {row.original.savingsPercentage?.toFixed(1) || '0'}%
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="text-gray-900">
            {format(new Date(row.original.startDate), 'MMM dd, yyyy')}
          </div>
          <div className="text-gray-500">
            {format(new Date(row.original.startDate), 'HH:mm')}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="text-gray-900">
            {format(new Date(row.original.endDate), 'MMM dd, yyyy')}
          </div>
          <div className="text-gray-500">
            {format(new Date(row.original.endDate), 'HH:mm')}
          </div>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const round = row.original;
        const isActive = round.status === 'ACTIVE';
        const isDraft = round.status === 'DRAFT';

        return (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/rfq/${id}/round/${round.id}`)}
              className="p-1.5"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {isDraft && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStartRound(round.id)}
                className="p-1.5 text-green-600 hover:text-green-700"
                title="Start Round"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            
            {isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCloseRound(round.id)}
                className="p-1.5 text-orange-600 hover:text-orange-700"
                title="Close Round"
              >
                <Square className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/rfq/${id}/round/${round.id}/edit`)}
              className="p-1.5"
              title="Edit Round"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Handle create round
  const handleCreateRound = async (data: { description: string; endDate: string }) => {
    try {
      await createRound.mutateAsync({
        rfqId: id!,
        description: data.description,
        endDate: data.endDate,
      });
      toast.success('Round created successfully!');
      setCreateModalOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create round.');
    }
  };

  // Handle start round
  const handleStartRound = async (roundId: string) => {
    try {
      await updateRound.mutateAsync({
        roundId,
        status: 'ACTIVE',
      });
      toast.success('Round started successfully!');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to start round.');
    }
  };

  // Handle close round
  const handleCloseRound = async (roundId: string) => {
    try {
      await closeRound.mutateAsync(roundId);
      toast.success('Round closed successfully!');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to close round.');
    }
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

  if (isLoadingDetails || isLoadingRounds) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!rfqDetails) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">RFQ Not Found</h3>
        <p className="text-gray-500 mb-4">The requested RFQ could not be found.</p>
        <Button onClick={() => navigate('/rfq')}>
          Back to RFQ List
        </Button>
      </div>
    );
  }

  const rounds = roundsData || [];
  const activeRounds = rounds.filter(round => round.status === 'ACTIVE');
  const totalSavings = rounds.reduce((sum, round) => sum + (round.savings || 0), 0);
  const totalOffers = rounds.reduce((sum, round) => sum + (round.totalOffers || 0), 0);

  return (
    <div className="p-6">
      <PageHeader 
        title="RFQ Rounds Management"
        subtitle={`${rfqDetails.eventCode} - ${rfqDetails.title}`}
        showBackButton={true}
      >
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="primary"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Round
          </Button>
        </div>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rounds</p>
                <p className="text-2xl font-bold text-gray-900">{rounds.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Rounds</p>
                <p className="text-2xl font-bold text-green-600">{activeRounds.length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Offers</p>
                <p className="text-2xl font-bold text-gray-900">{totalOffers}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-green-600">₹{totalSavings.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rounds Table */}
      <Card>
        <CardHeader>
          <CardTitle>RFQ Rounds</CardTitle>
          <p className="text-sm text-gray-600">
            Manage and track all rounds for this RFQ
          </p>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rounds}
            totalItems={rounds.length}
            isLoading={isLoadingRounds}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSize={pagination.pageSize}
            currentPage={pagination.pageIndex + 1}
          />
        </CardContent>
      </Card>

      {/* Create Round Modal */}
      <CreateRoundModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateRound}
        isLoading={createRound.isPending}
      />
    </div>
  );
};

export default RFQRounds;
