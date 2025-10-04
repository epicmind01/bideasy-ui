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
  useGetRFQVendorOffersApi,
  useGetRFQCollaboratorsApi 
} from '../../hooks/API/RFQApi';
import type { VendorOffer } from '../../Typings/RFQTypes';
import { 
  Eye, 
  Users, 
  Package, 
  Calendar, 
  TrendingUp,
  FileText,
  Download,
  Send,
  MoreHorizontal
} from 'lucide-react';

interface RFQViewProps {
  // Add props here when needed
}

const RFQView: React.FC<RFQViewProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'items' | 'collaborators'>('overview');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // API hooks
  const { data: rfqDetails, isLoading: isLoadingDetails } = useGetRFQDetailsApi(id!);
  const { data: vendorOffers, isLoading: isLoadingOffers } = useGetRFQVendorOffersApi(id!);
  const { data: collaborators } = useGetRFQCollaboratorsApi(id!);

  // Vendor offers columns
  const vendorColumns: ColumnDef<VendorOffer>[] = [
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
          'PENDING': { color: 'warning', text: 'Pending' },
          'SUBMITTED': { color: 'info', text: 'Submitted' },
          'ACCEPTED': { color: 'success', text: 'Accepted' },
          'REJECTED': { color: 'error', text: 'Rejected' },
          'COUNTER_OFFER': { color: 'primary', text: 'Counter Offer' },
        }[status] || { color: 'primary', text: status };

        return (
          <Badge variant="light" color={statusConfig.color as any} size="sm">
            {statusConfig.text}
          </Badge>
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
      accessorKey: 'round',
      header: 'Round',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Round {row.original.round || 1}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/rfq/${id}/vendor/${row.original.vendorId}`)}
            className="p-1.5"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/rfq/${id}/comparison?vendor=${row.original.vendorId}`)}
            className="p-1.5"
          >
            <TrendingUp className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Items columns
  const itemColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'itemCode',
      header: 'Item Code',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-gray-900">
          {row.original.itemCode}
        </span>
      ),
    },
    {
      accessorKey: 'itemName',
      header: 'Item Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.original.itemName}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.brandName && `Brand: ${row.original.brandName}`}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      cell: ({ row }) => (
        <span className="text-gray-900">
          {row.original.annualVolumeQuantity?.toLocaleString() || '0'}
        </span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.original.MasterCategory?.name || 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: 'generic',
      header: 'Generic',
      cell: ({ row }) => (
        <span className="text-gray-600">
          {row.original.MasterGeneric?.name || 'N/A'}
        </span>
      ),
    },
  ];

  if (isLoadingDetails) {
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

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'DRAFT': 'warning',
      'PUBLISHED': 'info',
      'IN_NEGOTIATIONS': 'primary',
      'IN_APPROVAL': 'primary',
      'COMPLETED': 'success',
      'CANCELLED': 'error',
    };
    return statusMap[status] || 'primary';
  };

  return (
    <div className="p-6">
      <PageHeader 
        title={`RFQ: ${rfqDetails.eventCode}`}
        subtitle={rfqDetails.title}
        showBackButton={true}
      >
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Send Reminder
          </Button>
          <Button size="sm" variant="primary">
            <MoreHorizontal className="h-4 w-4 mr-2" />
            Actions
          </Button>
        </div>
      </PageHeader>

      {/* RFQ Overview Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <FileText className="h-5 w-5" />
              RFQ Overview
            </CardTitle>
            <Badge 
              variant="light" 
              color={getStatusColor(rfqDetails.overAllStatus) as any} 
              size="sm"
            >
              {rfqDetails.overAllStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Start Date
              </div>
              <div className="font-medium">
                {rfqDetails.technicalSpec?.startDate 
                  ? format(new Date(rfqDetails.technicalSpec.startDate), 'MMM dd, yyyy')
                  : 'Not set'
                }
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                End Date
              </div>
              <div className="font-medium">
                {rfqDetails.technicalSpec?.endDate 
                  ? format(new Date(rfqDetails.technicalSpec.endDate), 'MMM dd, yyyy')
                  : 'Not set'
                }
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                Vendors Responded
              </div>
              <div className="font-medium">
                {rfqDetails._count?.vendorOffers || 0} / {rfqDetails._count?.vendors || 0}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package className="h-4 w-4" />
                Items Completed
              </div>
              <div className="font-medium">
                {rfqDetails.arcItems || 0} / {rfqDetails.totalItems || 0}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: FileText },
              { id: 'vendors', name: 'Vendors', icon: Users },
              { id: 'items', name: 'Items', icon: Package },
              { id: 'collaborators', name: 'Collaborators', icon: Users },
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
                <CardTitle>RFQ Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Department</label>
                  <p className="text-gray-900">{rfqDetails.department?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created By</label>
                  <p className="text-gray-900">{rfqDetails.buyerName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-gray-900">
                    {format(new Date(rfqDetails.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Terms</label>
                  <p className="text-gray-900">{rfqDetails.technicalSpec?.paymentTerms || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate(`/rfq/${id}/comparison`)}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Comparison
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate(`/rfq/${id}/rounds`)}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Manage Rounds
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => navigate(`/rfq/${id}/edit`)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Edit RFQ
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'vendors' && (
          <Card>
            <CardHeader>
              <CardTitle>Vendor Responses</CardTitle>
              <p className="text-sm text-gray-600">
                {vendorOffers?.length || 0} vendors have responded to this RFQ
              </p>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={vendorColumns}
                data={vendorOffers || []}
                totalItems={vendorOffers?.length || 0}
                isLoading={isLoadingOffers}
                onPageChange={(page) => setPagination(prev => ({ ...prev, pageIndex: page - 1 }))}
                onPageSizeChange={(pageSize) => setPagination(prev => ({ ...prev, pageSize, pageIndex: 0 }))}
                pageSize={pagination.pageSize}
                currentPage={pagination.pageIndex + 1}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'items' && (
          <Card>
            <CardHeader>
              <CardTitle>RFQ Items</CardTitle>
              <p className="text-sm text-gray-600">
                {rfqDetails.items?.length || 0} items in this RFQ
              </p>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={itemColumns}
                data={rfqDetails.items || []}
                totalItems={rfqDetails.items?.length || 0}
                isLoading={false}
                onPageChange={(page) => setPagination(prev => ({ ...prev, pageIndex: page - 1 }))}
                onPageSizeChange={(pageSize) => setPagination(prev => ({ ...prev, pageSize, pageIndex: 0 }))}
                pageSize={pagination.pageSize}
                currentPage={pagination.pageIndex + 1}
              />
            </CardContent>
          </Card>
        )}

        {activeTab === 'collaborators' && (
          <Card>
            <CardHeader>
              <CardTitle>Collaborators</CardTitle>
              <p className="text-sm text-gray-600">
                {collaborators?.length || 0} collaborators assigned to this RFQ
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collaborators?.map((collaborator: any) => (
                  <div key={collaborator.id} className="flex items-center p-4 border rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-blue-600 font-semibold">
                        {collaborator.collaborator?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {collaborator.collaborator?.name || 'Unknown User'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {collaborator.collaborator?.email || 'No email'}
                      </div>
                    </div>
                    <Badge variant="light" color="primary" size="sm">
                      {collaborator.role || 'Collaborator'}
                    </Badge>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    No collaborators assigned
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RFQView;
