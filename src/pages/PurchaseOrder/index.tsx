import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/button/Button';
import PageHeader from '../../components/ui/page-header/PageHeader';
import Badge from '../../components/ui/badge/Badge';
import { DataTable } from '../../components/ui/data-table/DataTableFixed';
import { 
  useClonePurchaseOrderApi, 
  useDeletePurchaseOrderApi, 
  useGetPurchaseOrderList 
} from '../../hooks/API/PurchaseOrderApi';
import type { PurchaseOrder } from '../../Typings/PurchaseOrderTypes';

const BuyersTopTabsData = [
  { label: "All", value: "All" },
  { label: "DRAFT", value: "DRAFT" },
  { label: "ACCEPTED", value: "ACCEPTED" },
  { label: "PENDING", value: "PENDING" },
  { label: "ACKNOWLEDGED", value: "ACKNOWLEDGED" },
  { label: "REJECTED", value: "REJECTED" },
  { label: "IN_APPROVAL", value: "IN_APPROVAL" },
  { label: "PROCESSED", value: "PROCESSED" },
  { label: "PROCESS_WITHDRAWN", value: "PROCESS_WITHDRAWN" },
  { label: "APPROVED", value: "APPROVED" },
  { label: "COMPLETED", value: "COMPLETED" }
];

const PurchaseOrderList = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const searchObj = useMemo(() => {
    const obj: Record<string, any> = {};

    if (activeTab !== 'All') {
      obj.status = activeTab;
    }
    if (searchQuery !== "") {
      obj.search = searchQuery;
    }
    return obj;
  }, [activeTab, searchQuery]);

  const { data: purchaseOrderData, isLoading } = useGetPurchaseOrderList(
    pagination.pageIndex + 1,
    pagination.pageSize,
    searchObj
  ) as { data: any; isLoading: boolean };

  const { mutate: clonePurchaseRequest } = useClonePurchaseOrderApi();

  const handleCopyPurchaseRequest = (row: PurchaseOrder) => {
    clonePurchaseRequest({ purchaseOrderId: row.id }, {
      onSuccess: (res: any) => {
        if (res.status === 200) {
          toast.success(res.data.message);
        }
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to copy Purchase Order");
      }
    });
  };

  const { mutate: deletePurchaseOrder } = useDeletePurchaseOrderApi();
  
  const handleDeletePurchaseOrder = (purchaseOrderId: string) => {
    const confirmDelete = () => {
      deletePurchaseOrder({ purchaseOrderId }, {
        onSuccess: (res: any) => {
          if (res.status === 200) {
            toast.success(res.data.message);
          }
        },
        onError: (err: any) => {
          console.log(err);
          toast.error("Something went wrong.");
        }
      });
    };

    toast(
      (t) => (
        <div>
          <p>Are you sure you want to delete this Purchase Order?</p>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <button
              onClick={() => {
                confirmDelete();
                toast.dismiss(t.id);
              }}
              style={{
                background: "#d33",
                color: "white",
                padding: "6px 12px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                background: "#3085d6",
                color: "white",
                padding: "6px 12px",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      }
    );
  };

  // Define columns
  const columns = useMemo<ColumnDef<PurchaseOrder>[]>(
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
        accessorKey: 'purchaseOrderNumber',
        header: 'PO Number',
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="p-0 h-auto hover:underline ring-0 border-0 text-brand-600 dark:text-brand-400"
            onClick={() => navigate(`/purchase-order/${row.original.id}`)}
          >
            {row.original.purchaseOrderNumber || "N/A"}
          </Button>
        ),
      },
      {
        accessorKey: 'prAuctionNumber',
        header: 'PR/AUCTION Number',
        cell: ({ row }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {row.original.purchaseRequest?.purchaseRequestNumber || row.original.auction?.eventCode || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'vendor',
        header: 'Vendor',
        cell: ({ row }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {row.original.vendor?.tempName || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'qtyRequested',
        header: 'Quantity',
        cell: ({ row }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {row.original.qtyRequested || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          const lower = status.toLowerCase();
          
          if (lower === 'completed' || lower === 'approved' || lower === 'accepted') {
            return <Badge variant="light" color="success" size="sm">{status}</Badge>;
          }
          if (lower === 'rejected') {
            return <Badge variant="light" color="error" size="sm">{status}</Badge>;
          }
          if (lower === 'pending') {
            return <Badge variant="light" color="warning" size="sm">{status}</Badge>;
          }
          if (lower === 'draft') {
            return <Badge variant="light" color="primary" size="sm">{status}</Badge>;
          }
          if (lower === 'in_approval') {
            return <Badge variant="light" color="primary" size="sm">{status}</Badge>;
          }
          return <Badge variant="light" color="primary" size="sm">{status}</Badge>;
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
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
              onClick={() => navigate(`/purchase-order/${row.original.id}`)}
              className="p-1.5 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={() => navigate(`/purchase-order/edit/${row.original.id}`)}
              className="p-1.5 text-gray-500 hover:text-emerald-500 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => handleCopyPurchaseRequest(row.original)}
              className="p-1.5 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Copy PO"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => handleDeletePurchaseOrder(row.original.id)}
              className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ),
      },
    ],
    [navigate, handleCopyPurchaseRequest, handleDeletePurchaseOrder]
  );

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  // Handle export of selected rows
  const handleExport = useCallback(() => {
    if (!purchaseOrderData?.data) return;
    
    const selectedRows = Object.keys(rowSelection).map(rowIndex => 
      purchaseOrderData.data[parseInt(rowIndex, 10)]
    );
    
    if (selectedRows.length === 0) {
      alert('No items selected for export');
      return;
    }
    
    // Here you can implement your export logic
    console.log('Exporting selected rows:', selectedRows);
    alert(`Exporting ${selectedRows.length} selected items`);
  }, [rowSelection, purchaseOrderData?.data]);

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
        title="All Purchase Orders" 
        subtitle="Manage your purchase orders and track vendor responses"
        showBackButton={true}
      >
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">Filters</Button>
          <Button size="sm" variant="outline" onClick={handleExport}>
            Export
          </Button>
          <Button size="sm" variant="primary" onClick={() => navigate('/purchase-order/create-from-prs')}>
            + Create PO from PRs
          </Button>
          <Button size="sm" variant="primary" onClick={() => navigate('/purchase-order/create-manual-po')}>
            + Create Manual PO
          </Button>
        </div>
      </PageHeader>

      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            {BuyersTopTabsData.map((tab) => {
              const count = 0; // TODO: Get count from API response
              
              return (
                <button
                  key={tab.value}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 border ${
                    activeTab === tab.value
                      ? 'bg-brand-100 text-brand-700 hover:bg-brand-200 border-brand-200 dark:bg-brand-600/30 dark:border-brand-600/50 dark:text-white dark:hover:bg-brand-700/40'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${count === 0 ? 'opacity-70' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.value);
                    setSearchQuery('');
                  }}
                >
                  <span>{tab.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.value
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
              placeholder="Search Purchase Orders..."
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
          data={purchaseOrderData?.data || []}
          pagination={{
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
            total: purchaseOrderData?.totalCount || 0
          }}
          onPaginationChange={(updater) => {
            if (typeof updater === 'function') {
              const newPagination = updater(pagination);
              setPagination(newPagination);
            }
          }}
        />
      </div>
    </div>
  );
};

export default PurchaseOrderList;
