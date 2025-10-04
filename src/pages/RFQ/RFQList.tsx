import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import { Modal } from '../../components/ui/modal/Modal';
import Button from '../../components/ui/button/Button';
import PageHeader from '../../components/ui/page-header/PageHeader';
import Badge from '../../components/ui/badge/Badge';
import { DataTable } from '../../components/ui/data-table/DataTableFixed';
import { 
  useGetRFQListApi, 
  useDeleteRFQApi, 
  useCloneRFQApi
} from '../../hooks/API/RFQApi';
import type { RFQData, RFQListParams } from '../../Typings/RFQTypes';

const RFQList = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rfqToDelete, setRfqToDelete] = useState<RFQData | null>(null);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [rfqToClone, setRfqToClone] = useState<RFQData | null>(null);
  
  // API hooks
  const { mutate: deleteRFQ, isPending: isDeleting } = useDeleteRFQApi();
  const { mutate: cloneRFQ, isPending: isCloning } = useCloneRFQApi();
  
  // const { mutate: exportRFQ, isPending: isExporting } = useExportRFQApi();
  
  const searchParams: RFQListParams = useMemo(() => ({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    search: searchQuery,
    status: activeTab === 'ALL' ? undefined : activeTab
  }), [pagination.pageIndex, pagination.pageSize, searchQuery, activeTab]);
  
  const { data: rfqData, isLoading, refetch } = useGetRFQListApi(searchParams);
  
  // Define columns
  const columns = useMemo<ColumnDef<RFQData>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <div className="px-1">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              checked={table.getIsAllPageRowsSelected()}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </div>
        ),
        size: 40,
      },
      {
        accessorKey: 'eventCode',
        header: 'RFQ No.',
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="p-0 h-auto hover:underline ring-0 border-0 text-brand-600 dark:text-brand-400"
            onClick={() => navigate(`/rfq/${row.original.id}`)}
          >
            {row.original.eventCode}
          </Button>
        ),
      },
      {
        accessorKey: 'title',
        header: 'RFQ Title',
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">
              {row.original.title}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.original.department?.name || 'General'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'vendorResponse',
        header: 'Supplier Responded',
        cell: ({ row }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {row.original._count?.vendorOffers || 0}/{row.original._count?.vendors || 0} responded
          </span>
        ),
      },
      {
        accessorKey: 'itemsCompleted',
        header: 'Items Completed',
        cell: ({ row }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {row.original.arcItems || 0}/{row.original.totalItems || 0} items
          </span>
        ),
      },
      {
        accessorKey: 'overAllStatus',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.overAllStatus;
          const lower = status.toLowerCase();
          
          if (lower === 'completed') {
            return <Badge variant="light" color="success" size="sm">{status}</Badge>;
          }
          if (lower === 'cancelled') {
            return <Badge variant="light" color="error" size="sm">{status}</Badge>;
          }
          if (lower === 'published') {
            return <Badge variant="light" color="info" size="sm">{status}</Badge>;
          }
          if (lower === 'draft') {
            return <Badge variant="light" color="warning" size="sm">{status}</Badge>;
          }
          if (lower === 'in_negotiations') {
            return <Badge variant="light" color="primary" size="sm">{status}</Badge>;
          }
          if (lower === 'in_approval') {
            return <Badge variant="light" color="primary" size="sm">{status}</Badge>;
          }
          return <Badge variant="light" color="primary" size="sm">{status}</Badge>;
        },
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        cell: ({ row }) => {
          const startDate = row.original.technicalSpec?.startDate;
          if (!startDate) return <span className="text-gray-500">-</span>;
          
          try {
            return format(new Date(startDate), 'MMM dd, yyyy');
          } catch {
            return <span className="text-gray-500">Invalid date</span>;
          }
        },
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: ({ row }) => {
          const endDate = row.original.technicalSpec?.endDate;
          if (!endDate) return <span className="text-gray-500">-</span>;
          
          try {
            return format(new Date(endDate), 'MMM dd, yyyy');
          } catch {
            return <span className="text-gray-500">Invalid date</span>;
          }
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Creation Date',
        cell: ({ row }) => {
          try {
            return format(new Date(row.original.createdAt), 'MMM dd, yyyy');
          } catch {
            return <span className="text-gray-500">Invalid date</span>;
          }
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/rfq/${row.original.id}`)}
              className="p-1.5 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={() => navigate(`/rfq/comparison?id=${row.original.id}`)}
              className="p-1.5 text-gray-500 hover:text-purple-500 rounded-full hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              title="Comparison"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button
              onClick={() => navigate(`/rfq/edit?id=${row.original.id}`)}
              className="p-1.5 text-gray-500 hover:text-emerald-500 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => {
                setRfqToClone(row.original);
                setCloneModalOpen(true);
              }}
              className="p-1.5 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Clone"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row.original);
              }}
              className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete"
              disabled={isDeleting}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  );
  
  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      pageIndex: page - 1
    }));
  }, [isDeleting]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize,
      pageIndex: 0 // Reset to first page when changing page size
    }));
  }, []);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  // Handle delete confirmation
  const handleDeleteClick = (rfq: RFQData) => {
    setRfqToDelete(rfq);
    setDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = useCallback(() => {
    if (!rfqToDelete) return;
    
    deleteRFQ(rfqToDelete.id, {
      onSuccess: () => {
        refetch();
        setDeleteModalOpen(false);
        setRfqToDelete(null);
      },
      onError: (error) => {
        console.error('Failed to delete RFQ:', error);
      },
    });
  }, [rfqToDelete, deleteRFQ, refetch]);

  // Handle confirm clone
  const handleConfirmClone = useCallback(() => {
    if (!rfqToClone) return;
    
    cloneRFQ(rfqToClone.id, {
      onSuccess: () => {
        refetch();
        setCloneModalOpen(false);
        setRfqToClone(null);
      },
      onError: (error) => {
        console.error('Failed to clone RFQ:', error);
      },
    });
  }, [rfqToClone, cloneRFQ, refetch]);

  // Handle export of selected rows
  const handleExport = useCallback(() => {
    if (!rfqData?.data) return;
    
    const selectedRows = Object.keys(rowSelection).map(rowIndex => 
      rfqData.data[parseInt(rowIndex, 10)]
    );
    
    if (selectedRows.length === 0) {
      alert('No items selected for export');
      return;
    }
    
    // Export selected rows
    const csvData = convertToCSV(selectedRows);
    downloadCSV(csvData, 'rfq_events.csv');
  }, [rowSelection, rfqData?.data]);

  // Convert data to CSV
  const convertToCSV = (data: RFQData[]) => {
    const headers = ['Event No.', 'RFQ Title', 'Supplier Responded', 'Status', 'Date'];
    const rows = data.map((row) => [
      row.eventCode,
      row.title,
      `${row._count?.vendorOffers || 0}/${row._count?.vendors || 0}`,
      row.overAllStatus,
      new Date(row.createdAt).toDateString(),
    ]);

    const csvRows = [headers.join(','), ...rows.map((row) => row.join(','))];
    return csvRows.join('\n');
  };

  // Download CSV file
  const downloadCSV = (csvData: string, fileName: string) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <PageHeader 
        title="Request for Quotation (RFQ)" 
        subtitle="Manage your RFQ processes and vendor responses"
        showBackButton={true}
      >
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">Filters</Button>
          <Button size="sm" variant="outline" onClick={handleExport}>
            Export
          </Button>
          <Button size="sm" variant="primary" onClick={() => navigate('/rfq/create')}>
            + Create RFQ
          </Button>
        </div>
      </PageHeader>

      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            {[
              { label: 'All', key: 'ALL' },
              { label: 'Draft', key: 'DRAFT' },
              { label: 'Published', key: 'PUBLISHED' },
              { label: 'In Negotiations', key: 'IN_NEGOTIATIONS' },
              { label: 'In Approval', key: 'IN_APPROVAL' },
              { label: 'Completed', key: 'COMPLETED' },
              { label: 'Cancelled', key: 'CANCELLED' }
            ].map(({ label, key }) => {
              const count = (rfqData?.[key.toLowerCase() as keyof typeof rfqData] as number) ?? 0;
              
              return (
                <button
                  key={label}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 border ${
                    activeTab === key
                      ? 'bg-brand-100 text-brand-700 hover:bg-brand-200 border-brand-200 dark:bg-brand-600/30 dark:border-brand-600/50 dark:text-white dark:hover:bg-brand-700/40'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${count === 0 ? 'opacity-70' : ''}`}
                  onClick={() => {
                    setActiveTab(key);
                    setSearchQuery('');
                  }}
                >
                  <span>{label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === key
                      ? 'bg-brand-200/70 text-brand-700 dark:bg-white/20 dark:text-white'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700/80 dark:text-gray-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* Search Bar */}
          <div className="relative w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              placeholder="Search RFQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Selected Rows Actions */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-between">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            {Object.keys(rowSelection).length} item(s) selected
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleClearSelection}
              className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-800/50"
            >
              Clear Selection
            </Button>
            <Button 
              size="sm" 
              variant="primary"
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Selected
            </Button>
          </div>
        </div>
      )}

      {/* DataTable */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <DataTable
          columns={columns}
            data={rfqData?.data || []}
          totalItems={rfqData?.total || 0}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          pageSize={pagination.pageSize}
          currentPage={pagination.pageIndex + 1}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setRfqToDelete(null);
        }}
        title="Delete RFQ"
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setRfqToDelete(null);
        }}
      >
        <p className="text-gray-700 dark:text-gray-300">
          Are you sure you want to delete the RFQ "{rfqToDelete?.title}"? This action cannot be undone.
        </p>
      </Modal>

      {/* Clone Confirmation Modal */}
      <Modal
        isOpen={cloneModalOpen}
        onClose={() => {
          setCloneModalOpen(false);
          setRfqToClone(null);
        }}
        title="Clone RFQ"
        confirmText={isCloning ? 'Cloning...' : 'Clone'}
        cancelText="Cancel"
        onConfirm={handleConfirmClone}
        onCancel={() => {
          setRfqToClone(null);
        }}
      >
        <p className="text-gray-700 dark:text-gray-300">
          Are you sure you want to clone the RFQ "{rfqToClone?.title}"? This will create a copy of the RFQ.
        </p>
      </Modal>
    </div>
  );
};

export default RFQList;
