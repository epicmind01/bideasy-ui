import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import { useGetAuctionListApi } from '../../hooks/API/AuctionApi';
import type { AuctionData } from '../../Typings/AuctionTypes';
import { Table, TableHeader, TableRow, TableCell, TableBody } from '../../components/ui/table';

// Animated number component
const AnimatedNumber = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration / 16); // 60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.ceil(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

// Stat card component matching Table.tsx style
const StatCard = ({ 
  title, 
  value,
  color = 'bg-blue-500',
  bgColor = 'bg-blue-50',
  textColor = 'text-blue-500',
  description = ''
}: { 
  title: string; 
  value: number;
  color?: string;
  bgColor?: string;
  textColor?: string;
  description?: string;
}) => (
  <div className={`${bgColor} rounded-lg p-4 shadow-sm`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-2xl font-bold mt-1 ${textColor}`}>
          <AnimatedNumber value={value} />
        </p>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <div className={`h-10 w-10 rounded-full ${color} bg-opacity-20 flex items-center justify-center`}>
        <div className={`h-6 w-6 rounded-full ${color}`}></div>
      </div>
    </div>
  </div>
);

const formatDateTime = (dateString: string) => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  } catch (error) {
    return dateString;
  }
};

const AuctionList = () => {
  const navigate = useNavigate();
  const { data: auctionData, isLoading } = useGetAuctionListApi();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const tabs = [
    { key: 'all', label: 'All', count: auctionData?.total || 0, active: true },
    { key: 'draft', label: 'Draft', count: auctionData?.totalDraft || 0 },
    { key: 'scheduled', label: 'Scheduled', count: auctionData?.totalScheduled || 0 },
    { key: 'live', label: 'Live', count: auctionData?.totalLive || 0 },
    { key: 'closed', label: 'Closed', count: auctionData?.totalClosed || 0 },
    { key: 'awarded', label: 'Awarded', count: auctionData?.totalAwarded || 0 },
    { key: 'deleted', label: 'Deleted', count: auctionData?.totalDeleted || 0 },
  ];

  const pageSize = auctionData?.pageSize || 10;
  const totalPages = auctionData?.totalPages || 1;
  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = Math.min(startIdx + pageSize - 1, auctionData?.total || 0);

  const statusBadge = (status: string) => {
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
  };

  const handleViewAuction = (id: string) => {
    navigate(`/auction/${id}`);
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Auction</h1>
          <p className="text-sm text-gray-500">Manage your Auction processes and vendor responses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">Filters</Button>
          <Button size="sm" variant="primary" onClick={() => navigate('/auction/create')}>
            + Create Auction
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            size="sm"
            variant={tab.active ? 'primary' : 'outline'}
            className="rounded-full"
          >
            {tab.label}
            <span className={`ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs ${
              tab.active ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10'
            }`}>
              {tab.count}
            </span>
          </Button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Auctions" 
          value={auctionData?.total || 0}
          color="bg-blue-500"
          bgColor="bg-blue-50"
          textColor="text-blue-500"
          description={`${auctionData?.total || 0} total auctions`}
        />
        <StatCard 
          title="Live Auctions" 
          value={auctionData?.totalLive || 0}
          color="bg-green-500"
          bgColor="bg-green-50"
          textColor="text-green-500"
          description={`${auctionData?.totalLive || 0} currently live`}
        />
        <StatCard 
          title="Scheduled" 
          value={auctionData?.totalScheduled || 0}
          color="bg-amber-500"
          bgColor="bg-amber-50"
          textColor="text-amber-500"
          description={`${auctionData?.totalScheduled || 0} upcoming`}
        />
        <StatCard 
          title="Awarded" 
          value={auctionData?.totalAwarded || 0}
          color="bg-purple-500"
          bgColor="bg-purple-50"
          textColor="text-purple-500"
          description={`${auctionData?.totalAwarded || 0} completed`}
        />
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
            placeholder="Search auctions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-brand-600 to-brand-500 h-12">
              <TableCell isHeader className="text-white font-medium text-sm px-6 py-3">Event Code</TableCell>
              <TableCell isHeader className="text-white font-medium text-sm px-6 py-3">Auction Name</TableCell>
              <TableCell isHeader className="text-white font-medium text-sm px-6 py-3">Start Time</TableCell>
              <TableCell isHeader className="text-white font-medium text-sm px-6 py-3">End Time</TableCell>
              <TableCell isHeader className="text-white font-medium text-sm px-6 py-3">Status</TableCell>
              <TableCell isHeader className="text-white font-medium text-sm px-6 py-3">Suppliers Responded</TableCell>
              <TableCell isHeader className="text-white font-medium text-sm px-6 py-3">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auctionData?.data?.map((auction) => (
              <TableRow key={auction.id}>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="font-mono text-xs px-2 py-1"
                    onClick={() => handleViewAuction(auction.id)}
                  >
                    {auction.eventCode}
                  </Button>
                </TableCell>
                <TableCell>{auction.name}</TableCell>
                <TableCell>{formatDateTime(auction.startTime)}</TableCell>
                <TableCell>{formatDateTime(auction.extendTime)}</TableCell>
                <TableCell>{statusBadge(auction.status)}</TableCell>
                <TableCell>{auction.Supplier_Responded}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewAuction(auction.id)}
                      title="View"
                    >
                      👁️
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => console.log('Edit', auction.id)}
                      title="Edit"
                    >
                      ✏️
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Rows per page:
              <select
                className="ml-2 rounded-md border border-gray-200 bg-transparent px-2 py-1 dark:border-gray-800"
                value={pageSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  // Update page size logic here if needed
                }}
              >
                {[10, 20, 30, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </span>
            <span>
              {startIdx}-{endIdx} of {auctionData?.total || 0} items
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(1)}
            >
              «
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              ‹
            </Button>
            <span className="px-2 text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              ›
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(totalPages)}
            >
              »
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionList;
       