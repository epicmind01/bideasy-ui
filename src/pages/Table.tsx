import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/button/Button'
import Badge from '../components/ui/badge/Badge'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../components/ui/table'
export default function RFQTable() {
  const navigate = useNavigate();
  const tabs = [
    { key: 'all', label: 'All', count: 47, active: true },
    { key: 'draft', label: 'Draft', count: 3 },
    { key: 'published', label: 'Published', count: 0 },
    { key: 'in_negotiations', label: 'In_Negotiations', count: 3 },
    { key: 'in_approval', label: 'In_Approval', count: 3 },
    { key: 'completed', label: 'Completed', count: 11 },
    { key: 'cancelled', label: 'Cancelled', count: 5 },
    { key: 'closed', label: 'Closed', count: 25 },
  ];

    const [counts, setCounts] = useState([0, 0, 0, 0]);
  const targetCounts = [22, 14, 45, 12];

  useEffect(() => {
    const animateCount = (start: number, end: number, index: number) => {
      const range = end - start;
      const duration = 1000; // 1 second
      const minFrameTime = 50; // 50ms per frame (20fps)
      const steps = Math.ceil(duration / minFrameTime);
      const stepValue = range / steps;
      let current = start;
      let step = 0;

      const timer = setInterval(() => {
        current += stepValue;
        step++;
        
        if (step >= steps) {
          current = end;
          clearInterval(timer);
        }

        setCounts(prev => {
          const newCounts = [...prev];
          newCounts[index] = Math.min(Math.round(current), end);
          return newCounts;
        });
      }, minFrameTime);

      return () => clearInterval(timer);
    };

    targetCounts.forEach((target, index) => {
      animateCount(0, target, index);
    });
  }, []);

  const stats = [
    { 
      label: 'Total RFQs', 
      value: counts[0], 
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-500',
      description: `${Math.floor(counts[0] * 1.5)} total items`
    },
    { 
      label: 'Active RFQs', 
      value: counts[1], 
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-500',
      description: `${Math.floor(counts[1] * 2)} items in progress`
    },
    { 
      label: 'In Negotiation', 
      value: counts[2], 
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-500',
      description: `${counts[2] * 3} suppliers involved`
    },
    { 
      label: 'Completed', 
      value: counts[3], 
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-500',
      description: `Avg. ${Math.floor(counts[3] * 1.2)} days to complete`
    },
  ];

  type Row = {
    rfq: string;
    title: string;
    subtitle: string;
    supplierResponded: string; // e.g. 0/9 responded
    itemsCompleted: string; // e.g. 0/6 items
    status: 'Closed' | 'Cancelled' | 'Negotiations';
    startDate: string;
    endDate: string;
    createdOn: string;
  };

  const baseRows: Row[] = [
    {
      rfq: 'RFQ00047',
      title: 'Copy of Copy of for new round review',
      subtitle: 'PHARMA',
      supplierResponded: '0/9 responded',
      itemsCompleted: '0/6 items',
      status: 'Closed',
      startDate: 'Sep 27, 2025',
      endDate: 'Sep 27, 2025',
      createdOn: 'Sep 27, 2025',
    },
    {
      rfq: 'RFQ00046',
      title: 'Copy of for new round review',
      subtitle: 'PHARMA',
      supplierResponded: '0/9 responded',
      itemsCompleted: '0/6 items',
      status: 'Closed',
      startDate: 'Sep 26, 2025',
      endDate: 'Sep 26, 2025',
      createdOn: 'Sep 26, 2025',
    },
    {
      rfq: 'RFQ00045',
      title: 'New HYD',
      subtitle: 'PURCHASE',
      supplierResponded: '0/8 responded',
      itemsCompleted: '0/1 items',
      status: 'Cancelled',
      startDate: 'Sep 26, 2025',
      endDate: 'Oct 01, 2025',
      createdOn: 'Sep 26, 2025',
    },
    {
      rfq: 'RFQ00044',
      title: 'Area Wise Yearly',
      subtitle: 'PHARMA',
      supplierResponded: '2/8 responded',
      itemsCompleted: '5/6 items',
      status: 'Negotiations',
      startDate: 'Sep 25, 2025',
      endDate: 'Oct 03, 2025',
      createdOn: 'Sep 25, 2025',
    },
  ];

  // Expand to multiple pages of mock data
  const rowsAll: Row[] = Array.from({ length: 38 }, (_, i) => {
    const b = baseRows[i % baseRows.length];
    const n = 47 - i; // descending numbers
    return {
      ...b,
      rfq: `RFQ${String(n).padStart(5, '0')}`,
    };
  });

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(rowsAll.length / pageSize));
  const current = Math.min(page, totalPages);
  const startIdx = (current - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, rowsAll.length);
  const rows = rowsAll.slice(startIdx, endIdx);

  const statusBadge = (status: Row['status']) => {
    const lower = status.toLowerCase();
    if (lower.includes('closed') || lower.includes('cancel'))
      return <Badge variant="light" color="error" size="sm">{status}</Badge>;
    if (lower.includes('negoti'))
      return <Badge variant="light" color="info" size="sm">{status}</Badge>;
    return <Badge variant="light" color="primary" size="sm">{status}</Badge>;
  };

  const ActionIcons = ({ onView }: { onView: () => void }) => (
    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
      <button title="View" className="hover:text-gray-700" onClick={onView}>👁️</button>
      <button title="Edit" className="hover:text-gray-700">✏️</button>
      <button title="Link" className="hover:text-gray-700">🔗</button>
      <button title="Copy" className="hover:text-gray-700">📋</button>
      <button title="Delete" className="hover:text-gray-700">🗑️</button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Title + actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Request for Quotation (RFQ)</h1>
          <p className="text-sm text-gray-500">Manage your RFQ processes and vendor responses</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">Filters</Button>
          <Button size="sm" variant="primary" onClick={() => navigate('/form')}>+ Create RFQ</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <Button
            key={t.key}
            size="sm"
            variant={t.active ? 'primary' : 'outline'}
            className="rounded-full"
          >
            {t.label}
            <span className={`ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs ${t.active ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/10'}`}>{t.count}</span>
          </Button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div 
            key={stat.label}
            className={`${stat.bgColor} rounded-lg p-6 shadow-sm border border-transparent hover:shadow-md transition-all h-36 flex flex-col justify-center`}
          >
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>{stat.value}</p>
              <p className="text-sm text-gray-500 mt-2">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
        <input
          type="text"
          placeholder="Search RFQs..."
          className="w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-800"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
        <Table className="min-w-[960px] w-full">
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-brand-600 to-brand-500 text-white">
              <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">RFQ No.</TableCell>
              <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">RFQ Title</TableCell>
              <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Supplier</TableCell>
              <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Items Comp.</TableCell>
              <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</TableCell>
              <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Start Date</TableCell>
              <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">End Date</TableCell>
              <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Creation</TableCell>
              <TableCell isHeader className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-200 dark:divide-gray-800">
            {rows.map((r) => (
              <TableRow key={r.rfq} className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
                <TableCell className="px-4 py-4 text-sm font-medium text-brand-600">
                  <Button
                    size="sm"
                    variant="outline"
                    className="p-0 h-auto hover:underline ring-0 border-0"
                    onClick={() => navigate('/detail', { state: { rfq: r.rfq } })}
                  >
                    {r.rfq}
                  </Button>
                </TableCell>
                <TableCell className="px-4 py-4 text-sm">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-gray-500">{r.subtitle}</div>
                </TableCell>
                <TableCell className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{r.supplierResponded}</TableCell>
                <TableCell className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">{r.itemsCompleted}</TableCell>
                <TableCell className="px-4 py-4">{statusBadge(r.status)}</TableCell>
                <TableCell className="px-4 py-4 text-sm">{r.startDate}</TableCell>
                <TableCell className="px-4 py-4 text-sm">{r.endDate}</TableCell>
                <TableCell className="px-4 py-4 text-sm">{r.createdOn}</TableCell>
                <TableCell className="px-4 py-4"><ActionIcons onView={() => navigate('/detail', { state: { rfq: r.rfq } })} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination footer */}
        <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <span>
              Rows per page:
              <select
                className="ml-2 rounded-md border border-gray-200 bg-transparent px-2 py-1 dark:border-gray-800"
                value={pageSize}
                onChange={(e) => {
                  const next = parseInt(e.target.value, 10) || 10;
                  setPageSize(next);
                  setPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </span>
            <span>
              {startIdx + 1}-{endIdx} of {rowsAll.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" disabled={current === 1} onClick={() => setPage(1)}>
              «
            </Button>
            <Button size="sm" variant="outline" disabled={current === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              ‹
            </Button>
            <span className="px-2">Page {current} of {totalPages}</span>
            <Button size="sm" variant="outline" disabled={current === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              ›
            </Button>
            <Button size="sm" variant="outline" disabled={current === totalPages} onClick={() => setPage(totalPages)}>
              »
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
