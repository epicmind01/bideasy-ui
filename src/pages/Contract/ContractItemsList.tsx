import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import Button from '../../components/ui/button/Button';
import PageHeader from '../../components/ui/page-header/PageHeader';
import Badge from '../../components/ui/badge/Badge';
import { DataTable } from '../../components/ui/data-table/DataTable';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../services/axiosClient';
import {
  Calendar,
  Eye
} from 'lucide-react';

interface ContractItemData {
  id: string;
  contractId: string;
  contractNumber: string;
  itemId: string;
  itemCode: string;
  itemDescription: string;
  MasterGeneric:{
    name:string
  }
  MasterBrand:{
    name:string
  }
  quantity: number;
  price: number;
  vendorId: string;
  vendorName: string;
  status: string;
  createdAt: string;
  endDate: string;
  arcId: string;
  arcNumber: string;
  rfqId: string;
  rfqTitle: string;
  arcVendor:{
    tempCompanyName:string
  }
}

// StatusBadge component removed as it's now handled by Badge component

const ContractItemsList = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  
  // Status filter options
  const statusTabs = [
    { label: "All", value: "", count: 0 },
    { label: "Draft", value: "DRAFT", count: 0 },
    { label: "Active", value: "APPROVED", count: 0 },
    { label: "Pending", value: "PENDING", count: 0 },
    { label: "Rejected", value: "REJECTED", count: 0 },
  ];

  // API hook to get contract items with approved vendor responses
  const { data: contractItemsData, isLoading } = useQuery({
    queryKey: ['contract_items_list', pagination.pageIndex + 1, pagination.pageSize, searchQuery, activeTab],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/contract-items?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}&search=${searchQuery}&status=${activeTab === 'All' ? '' : activeTab}`
      );
      return response.data;
    },
  });

  // Define columns
  const columns = useMemo<ColumnDef<ContractItemData>[]>(
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
        accessorKey: 'contractNumber',
        header: 'Contract #',
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="p-0 h-auto hover:underline ring-0 border-0 text-brand-600 dark:text-brand-400"
            onClick={() => navigate(`/contracts/${row.original.contractId}`)}
          >
            {row.original.contractNumber}
          </Button>
        ),
      },
      {
        accessorKey: 'itemCode',
        header: 'Item Code',
        cell: ({ row }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {row.original.itemCode}
          </span>
        ),
      },
      {
        accessorKey: 'itemDescription',
        header: 'Generic',
        cell: ({ row }) => (
          <div className="max-w-xs truncate" title={row.original.itemDescription}>
            <span className="text-gray-700 dark:text-gray-300">
              {row.original.itemDescription}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'vendorName',
        header: 'Vendor',
        cell: ({ row }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {row.original.vendorName}
          </span>
        ),
      },
      {
        accessorKey: 'arcNumber',
        header: 'ARC #',
        cell: ({ row }) => (
          <span className="text-gray-700 dark:text-gray-300">
            {row.original.arcNumber}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Start Date',
        cell: ({ row }) => (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-gray-700 dark:text-gray-300">
              {row.original.createdAt}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        cell: ({ row }) => (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-600 mr-1" />
            <span className="text-gray-700 dark:text-gray-300">
              {row.original.endDate}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const status = row.original.status;
          const displayStatus = status === 'APPROVED' ? 'ACTIVE' : 
                               status === 'PENDING' ? 'PENDING' : 
                               status === 'REJECTED' ? 'REJECTED' : 
                               status === 'DRAFT' ? 'DRAFT' : 'EXPIRED';
          
          if (displayStatus === 'ACTIVE') {
            return <Badge variant="light" color="success" size="sm">{displayStatus}</Badge>;
          }
          if (displayStatus === 'REJECTED' || displayStatus === 'EXPIRED') {
            return <Badge variant="light" color="error" size="sm">{displayStatus}</Badge>;
          }
          if (displayStatus === 'PENDING') {
            return <Badge variant="light" color="warning" size="sm">{displayStatus}</Badge>;
          }
          return <Badge variant="light" color="primary" size="sm">{displayStatus}</Badge>;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/contracts/${row.original.contractId}`)}
              className="p-1.5 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="View Contract Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [navigate]
  );

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  // Handle export of selected rows
  const handleExport = useCallback(() => {
    if (!contractItemsData?.data) return;
    
    const selectedRows = Object.keys(rowSelection).map(rowIndex => 
      contractItemsData.data[parseInt(rowIndex, 10)]
    );
    
    if (selectedRows.length === 0) {
      alert('No items selected for export');
      return;
    }
    
    // Here you can implement your export logic
    console.log('Exporting selected rows:', selectedRows);
    alert(`Exporting ${selectedRows.length} selected items`);
  }, [rowSelection, contractItemsData?.data]);

  // Transform API data to table format
  const contractItems = contractItemsData?.data
    ? contractItemsData.data.map((item: any) => ({
        id: item.id,
        contractId: item.contractId,
        contractNumber: item.contract?.contractNumber || "N/A",
        itemId: item.itemId,
        itemCode: item.item?.itemCode || "N/A",
        itemDescription: item?.item?.MasterGeneric?.name || "N/A",
        quantity: item.quantity || 0,
        price: item.price || 0,
        vendorId: item.contract?.arcVendorId || "N/A",
        vendorName: item.contract?.arcVendor?.tempCompanyName || "N/A",
        status: item.status || "PENDING",
        createdAt: item.contract?.createdAt
          ? new Date(item.contract.createdAt).toLocaleDateString()
          : "N/A",
        endDate:item.contract?.createdAt ? 
          new Date(new Date(item.contract?.createdAt).getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()
          : 'N/A',
        arcId: item.contract?.arcId || "N/A",
        arcNumber: item.contract?.arc?.arcNumber || "N/A",
        rfqId: item.contract?.rfqId || "N/A",
        rfqTitle: item.contract?.rfq?.title || "N/A",
      }))
    : [];

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
        title="Contract Items List" 
        subtitle="View all contract items approved by vendors"
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
            {statusTabs.map((tab) => {
              const count = (contractItemsData?.[tab.value.toLowerCase() as keyof typeof contractItemsData] as number) ?? 0;
              
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
              placeholder="Search Contract Items..."
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
          data={contractItems}
          pagination={{
            pageIndex: pagination.pageIndex,
            pageSize: pagination.pageSize,
            total: contractItemsData?.totalRecords || 0
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

export default ContractItemsList;