import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { type ColumnDef } from '@tanstack/react-table';
import Button from '../../components/ui/button/Button';
import PageHeader from '../../components/ui/page-header/PageHeader';
import Badge from '../../components/ui/badge/Badge';
import DataTable from '../../components/ui/data-table/DataTable';
import { useGetAuctionListApi } from '../../hooks/API/AuctionApi';
import type { AuctionData } from '../../Typings/AuctionTypes';

const AuctionList = () => {
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  const { data: auctionData, isLoading } = useGetAuctionListApi({
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    search: searchQuery,
    status: activeTab === 'All' ? undefined : activeTab.toUpperCase()
  });
  
    // Define columns
    const columns = useMemo<ColumnDef<AuctionData>[]>(
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
          header: 'Event Code',
          cell: ({ row }) => (
            <Button
              variant="outline"
              size="sm"
              className="p-0 h-auto hover:underline ring-0 border-0 text-brand-600 dark:text-brand-400"
              onClick={() => navigate(`/auction/${row.original.id}`)}
            >
              {row.original.eventCode}
            </Button>
          ),
        },
        {
          accessorKey: 'name',
          header: 'Auction Name',
          cell: ({ getValue }) => <div className="font-medium">{getValue() as string}</div>,
        },
        {
          accessorKey: 'startTime',
          header: 'Start Time',
          cell: ({ getValue }) => {
            try {
              return format(new Date(getValue() as string), 'MMM dd, yyyy hh:mm a');
            } catch {
              return 'Invalid date';
            }
          },
        },
        {
          accessorKey: 'extendTime',
          header: 'End Time',
          cell: ({ getValue }) => {
            try {
              return format(new Date(getValue() as string), 'MMM dd, yyyy hh:mm a');
            } catch {
              return 'Invalid date';
            }
          },
        },
        {
          accessorKey: 'status',
          header: 'Status',
          cell: ({ getValue }) => {
            const status = getValue() as string;
            const lower = status.toLowerCase();
            if (lower === 'closed' || lower === 'cancelled') {
              return <Badge variant="light" color="error" size="sm">{status}</Badge>;
            }
            if (lower === 'live') {
              return <Badge variant="light" color="success" size="sm">{status}</Badge>;
            }
            if (lower === 'scheduled') {
              return <Badge variant="light" color="warning" size="sm">{status}</Badge>;
            }
            if (lower === 'draft') {
              return <Badge variant="light" color="info" size="sm">{status}</Badge>;
            }
            return <Badge variant="light" color="primary" size="sm">{status}</Badge>;
          },
        },
        {
          accessorKey: 'Supplier_Responded',
          header: 'Suppliers',
          cell: ({ getValue }) => (
            <span className="text-gray-700 dark:text-gray-300">
              {getValue() as string}
            </span>
          ),
        },
        {
          id: 'actions',
          header: 'Actions',
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/auction/${row.original.id}`)}
                className="p-1.5 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="View"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button
                onClick={() => console.log('Edit', row.original.id)}
                className="p-1.5 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clone this auction?')) {
                    console.log('Clone', row.original.id);
                    // Add your clone logic here
                  }
                }}
                className="p-1.5 text-gray-500 hover:text-green-500 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                title="Clone"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this auction?')) {
                    console.log('Delete', row.original.id);
                    // Add your delete logic here
                  }
                }}
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
      [navigate]
    );
  
    // Handle row click
  const handleRowClick = useCallback((row: AuctionData) => {
    navigate(`/auction/${row.id}`);
  }, [navigate]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      pageIndex: page - 1
    }));
  }, []);
  
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
          title="Auction" 
          subtitle="Manage your Auction processes and vendor responses"
          showBackButton={true}
        >
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">Filters</Button>
            <Button size="sm" variant="primary" onClick={() => navigate('/auction/create')}>
              + Create Auction
            </Button>
          </div>
        </PageHeader>
  
        {/* Tabs with counts */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              {[
                { label: 'All', key: 'total' },
                { label: 'Draft', key: 'totalDraft' },
                { label: 'Scheduled', key: 'totalScheduled' },
                { label: 'Live', key: 'totalLive' },
                { label: 'Closed', key: 'totalClosed' },
                { label: 'Awarded', key: 'totalAwarded' }
              ].map(({ label, key }) => {
                const count = (auctionData?.[key as keyof typeof auctionData] as number) ?? 0;
                
                return (
                  <button
                    key={label}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-1.5 border ${
                      activeTab === label
                        ? 'bg-brand-100 text-brand-700 hover:bg-brand-200 border-brand-200 dark:bg-brand-600/30 dark:border-brand-600/50 dark:text-white dark:hover:bg-brand-700/40'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600'
                    } ${count === 0 ? 'opacity-70' : ''}`}
                    onClick={() => {
                      setActiveTab(label);
                      // Reset search query when changing tabs
                      setSearchQuery('');
                    }}
                  >
                    <span>{label}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === label
                        ? 'bg-brand-200/70 text-brand-700 dark:bg-white/20 dark:text-white'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700/80 dark:text-gray-300'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>


        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
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
              placeholder="Search auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* DataTable */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <DataTable
            columns={columns}
            data={auctionData?.data || []}
            totalItems={auctionData?.total || 0}
            isLoading={isLoading}
            onPageChange={handlePageChange      }
            onRowClick={handleRowClick}
          />
        </div>
      </div>
    );
  };
  
  export default AuctionList;