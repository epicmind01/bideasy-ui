import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import Button from '../../components/ui/button/Button';
import PageHeader from '../../components/ui/page-header/PageHeader';
import Badge from '../../components/ui/badge/Badge';
import { DataTable } from '../../components/ui/data-table/DataTable';
import { useGetGoodsReceivedNoteList } from '../../hooks/API/GRNApi';
// import { formatDate } from "../../utils/Helpers";
import type { GoodReceiptNote } from '../../Typings/GRNTypes';

const GRNList = () => {
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
      obj.status = activeTab.toUpperCase();
    }
    if (searchQuery !== "") {
      obj.search = searchQuery;
    }
    return obj;
  }, [activeTab, searchQuery]);

  const { data: grnData, isLoading } = useGetGoodsReceivedNoteList(
    pagination.pageIndex + 1,
    pagination.pageSize,
    searchObj,
  );

  // Define columns
  const columns = useMemo<ColumnDef<GoodReceiptNote>[]>(
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
        accessorKey: 'grnNumber',
        header: 'GRN Number',
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="p-0 h-auto hover:underline ring-0 border-0 text-brand-600 dark:text-brand-400"
            onClick={() => navigate(`/grn-list/${row.original.id}`)}
          >
            {row.original.grnNumber}
          </Button>
        ),
      },
      {
        accessorKey: 'linkedPO',
        header: 'Linked PO',
        cell: ({ row }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {row.original.asn?.purchaseOrder?.purchaseOrderNumber || 
             (row.original.Invoice && row.original.Invoice.length > 0 ? row.original.Invoice[0]?.po?.purchaseOrderNumber : 'N/A')}
          </span>
        ),
      },
      {
        accessorKey: 'linkedASN',
        header: 'Linked ASN',
        cell: ({ row }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {row.original.asn?.asnNumber ?? 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'linkedInvoice',
        header: 'Linked Invoice',
        cell: ({ row }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {row.original.Invoice && row.original.Invoice.length > 0 ? row.original.Invoice[0].invoiceNumber : 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'totalQty',
        header: 'Total Qty',
        cell: ({ row }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {row.original.GoodReceiptNoteItem?.reduce((sum, item) => sum + item.totalQuantity, 0) || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'qtyAccepted',
        header: 'Qty Accepted',
        cell: ({ row }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {row.original.GoodReceiptNoteItem?.reduce((sum, item) => sum + item.quantity, 0) || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'grnCopy',
        header: 'GRN Copy',
        cell: ({ row }) => (
          row.original.GRNAttachment?.length > 0 ? (
            <a 
              href={row.original.GRNAttachment[0].fileUrl} 
              download 
              className="text-blue-600 hover:underline"
            >
              Download
            </a>
          ) : (
            <span className="text-gray-500">N/A</span>
          )
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          const lower = status.toLowerCase();
          
          if (lower === 'completed') {
            return <Badge variant="light" color="success" size="sm">{status}</Badge>;
          }
          if (lower === 'pending') {
            return <Badge variant="light" color="warning" size="sm">{status}</Badge>;
          }
          if (lower === 'rejected') {
            return <Badge variant="light" color="error" size="sm">{status}</Badge>;
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
              onClick={() => navigate(`/grn-list/${row.original.id}`)}
              className="p-1.5 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  // Handle page change
  // const handlePageChange = useCallback((page: number) => {
  //   setPagination(prev => ({
  //     ...prev,
  //     pageIndex: page - 1
  //   }));
  // }, []);

  // const handlePageSizeChange = useCallback((pageSize: number) => {
  //   setPagination(prev => ({
  //     ...prev,
  //     pageSize,
  //     pageIndex: 0 // Reset to first page when changing page size
  //   }));
  // }, []);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  // Handle export of selected rows
  const handleExport = useCallback(() => {
    if (!grnData?.grns) return;
    
    const selectedRows = Object.keys(rowSelection).map(rowIndex => 
      grnData.grn[parseInt(rowIndex, 10)]
    );
    
    if (selectedRows.length === 0) {
      alert('No items selected for export');
      return;
    }
    
    // Here you can implement your export logic
    console.log('Exporting selected rows:', selectedRows);
    alert(`Exporting ${selectedRows.length} selected items`);
  }, [rowSelection, grnData?.grn]);

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
        title="GRN List" 
        subtitle="Manage your Goods Receipt Notes and track deliveries"
        showBackButton={true}
      >
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">Filters</Button>
          <Button size="sm" variant="outline" onClick={handleExport}>
            Export
          </Button>
        </div>
      </PageHeader>

      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            {[
              { label: 'All', key: 'All' },
              { label: 'Pending', key: 'PENDING' },
              { label: 'Accepted', key: 'ACCEPTED' },
              { label: 'Rejected', key: 'REJECTED' },
              { label: 'In Approval', key: 'IN_APPROVAL' },
              { label: 'Approved', key: 'APPROVED' },
              { label: 'Completed', key: 'COMPLETED' }
            ].map(({ label, key }) => {
              const count = (grnData?.[key.toLowerCase() as keyof typeof grnData] as number) ?? 0;
              
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
              placeholder="Search GRN..."
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
          data={grnData?.grns || []}
          pagination={{
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
            total: grnData?.totalCount || 0
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

export default GRNList;
