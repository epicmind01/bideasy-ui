import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../components/ui/button/Button';
import { auctionDetail } from '../mocks/auctionDetail';
import { FileText, Users, Clock, Calendar, MapPin, Box, ChevronRight } from 'lucide-react';

type StatusType = 'LIVE' | 'COMPLETED' | 'PENDING' | 'CANCELLED' | 'WON' | 'LOST' | 'ACCEPTED' | string;

const statusColors: Record<StatusType, string> = {
  'LIVE': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'COMPLETED': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'PENDING': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  'CANCELLED': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  'WON': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'LOST': 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400',
  'ACCEPTED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  '': 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400', // Fallback
};

const DetailCard = ({ 
  icon, 
  title, 
  value, 
  description,
  className = '' 
}: { 
  icon: React.ReactNode, 
  title: string, 
  value: string | number, 
  description?: string,
  className?: string 
}) => (
  <div className={`bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-800 ${className}`}>
    <div className="flex items-center space-x-3">
      <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-lg font-semibold">{value}</p>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
      </div>
    </div>
  </div>
);

export default function Detail() {
  const location = useLocation() as { state?: { rfq?: string } };
  const rfqId = location.state?.rfq ?? 'RFQ00044';
  
  // Animation state for the stats cards
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const targetCounts = [24, 3, 0, 5]; // Total Bids, Participants, Time Remaining (not used), Items
  
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
      color: 'bg-[#2B59FF]',
      icon: '📋',
      bgColor: 'bg-white',
      textColor: 'text-gray-800',
      borderColor: 'border-l-4 border-l-blue-500',
      description: ''
    },
    { 
      label: 'Active RFQs', 
      value: counts[1], 
      color: 'bg-[#10B981]',
      icon: '📊',
      bgColor: 'bg-white',
      textColor: 'text-gray-800',
      borderColor: 'border-l-4 border-l-green-500',
      description: ''
    },
    { 
      label: 'In Negotiation', 
      value: counts[2], 
      color: 'bg-[#8B5CF6]',
      icon: '🤝',
      bgColor: 'bg-white',
      textColor: 'text-gray-800',
      borderColor: 'border-l-4 border-l-purple-500',
      description: ''
    },
    { 
      label: 'Completed', 
      value: counts[3], 
      color: 'bg-[#F59E0B]',
      icon: '✅',
      bgColor: 'bg-white',
      textColor: 'text-gray-800',
      borderColor: 'border-l-4 border-l-amber-500',
      description: ''
    },
  ];

  const participants = [
    { code: 'MS001', name: 'MediSupplies Sales Team', email: 'sales@medsupplies.com', response: 'ACCEPTED', result: 'WON' },
    { code: 'YY001', name: 'YopVendor Team', email: 'vendor1@yopmail.com', response: 'PENDING', result: 'LOST' },
    { code: 'MP001', name: 'MedPharma Sales Team', email: 'sales@medpharma.com', response: 'PENDING', result: 'LOST' },
  ] as const;

  const fmt = (iso?: string) => iso ? new Date(iso).toLocaleString() : '--';
  const yesNo = (v?: boolean) => v ? 'YES' : 'NO';
  const infoLeft = [
    ['Auction Behavior', auctionDetail.auctionBehavior],
    ['Start Time', fmt(auctionDetail.startTime)],
    ['End Time', fmt(auctionDetail.endTime)],
    ['Time Until Start', '--'],
    ['Enable Max Bid Difference', yesNo(auctionDetail.auctionInfo.maxBidDifferenceEnabled)],
    ['Reserved Buying/Sealing', auctionDetail.auctionInfo.reservedBuyingSelling ?? '-'],
    ['Display Of Participation Rank?', auctionDetail.auctionInfo.participationRankDisplay ?? '-'],
    ['Mask Vendor Company Names?', yesNo(auctionDetail.auctionInfo.maskVendorCompanyNames)],
    ['Winner Announcement after Auction End?', auctionDetail.winnerAnnounced],
  ];
  const infoRight = [
    ['Does Item Have First Quote?', yesNo(auctionDetail.auctionInfo.itemHasFirstQuote)],
    ['Display Leading Price To Vendors', yesNo(auctionDetail.auctionInfo.displayLeadingPriceToVendors)],
    ['Minimum Bid Difference Other Contractors Price', String(auctionDetail.auctionInfo.minBidDifferenceContractors ?? '-')],
    ['Max Bid Difference Price', String(auctionDetail.auctionInfo.maxBidDifferencePrice ?? '-')],
    ['Reserved Buying/Sealing Price', String(auctionDetail.auctionInfo.reserveBuyingSellingPrice ?? '-')],
    ['Single Bid', yesNo(auctionDetail.auctionInfo.singleBidEnabled)],
    ['Is Vendor Bid Price Masked?', yesNo(auctionDetail.auctionInfo.isVendorBidPriceMasked)],
    ['Leading Price', new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(auctionDetail.leadingPrice/100)],
  ];

  const sheets = auctionDetail.itemsSheets.map((s, idx) => ({
    key: String(idx),
    name: s.name,
    rows: s.items.length,
    columns: s.itemHeaders.length,
    headers: s.itemHeaders,
    items: s.items,
  }));

  const statusToBadge = (label: string) => {
    const normalized = label.toUpperCase() as StatusType;
    const colorClass = statusColors[normalized] || statusColors[''];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Auction Details</h1>
          <div className="flex items-center space-x-2 mt-1">
            {statusToBadge(auctionDetail.status)}
            <span className="text-sm text-gray-500">#{rfqId}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <span>View History</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="primary">Take Action</Button>
        </div>
      </div>

      {/* Animated Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div 
            key={stat.label}
            className={`${stat.bgColor} ${stat.borderColor} rounded-r-lg shadow-sm p-5 transition-all duration-300 hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-800">
                  {stat.value}
                </p>
              </div>
              <div className={`h-10 w-10 rounded-full ${stat.color.replace('bg-', 'bg-opacity-20 bg-')} flex items-center justify-center text-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Auction Details Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold">{auctionDetail.name}</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-300">{'No description available'}</p>
            
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Event Code</p>
                <p className="mt-1 font-medium">{auctionDetail.eventCode}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Auction Type</p>
                <p className="mt-1">{auctionDetail.itemType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Auction Behavior</p>
                <p className="mt-1">{auctionDetail.auctionBehavior}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Time</p>
                <p className="mt-1">{fmt(auctionDetail.startTime)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">End Time</p>
                <p className="mt-1">{fmt(auctionDetail.endTime)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                <p className="mt-1 flex items-center">
                  <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                  <span>New York, USA</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="gap-1.5">
            <FileText className="h-4 w-4" />
            <span>View Documents</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Users className="h-4 w-4" />
            <span>Manage Participants</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>Schedule</span>
          </Button>
        </div>
      </div>

      {/* Participants Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Participants</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">Export</Button>
            <Button size="sm" variant="primary">Invite Participants</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {participants.map((p) => (
            <div key={p.code} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">{p.name}</h3>
                  <p className="text-sm text-gray-500">{p.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{p.code}</div>
                  <div className="mt-1">{statusToBadge(p.response)}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                <div>
                  <p className="text-xs text-gray-500">Auction Result</p>
                  <div className="mt-1">{statusToBadge(p.result)}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20 border-transparent hover:border-brand-200 dark:hover:border-brand-800"
                >
                  View Details <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Select Sheet */}
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Select Sheet</h3>
          <div className="text-sm text-gray-500">2 sheets available</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sheets.map((s, idx) => (
            <Button key={s.key} size="sm" variant="outline" className={`${idx===0 ? 'bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-500/10 dark:border-brand-400/20' : ''}`}>
              {s.name} <span className="ml-2 text-xs text-gray-500">{s.rows} rows</span>
            </Button>
          ))}
        </div>

        {/* Active sheet table (Second) */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 text-sm dark:border-gray-800">
            <div className="font-medium">{sheets[0]?.name}</div>
            <div className="text-sm text-violet-600">Installation Pricing</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[560px] w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Description of Work</th>
                  <th className="px-4 py-2 text-left">Units</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {sheets[0]?.items.map((it, i) => (
                  <tr key={i} className="bg-white dark:bg-gray-900">
                    <td className="px-4 py-2 text-sm">{i+1}</td>
                    <td className="px-4 py-2 text-sm">{it.data['DESCRIPTION OF WORK'] as string}</td>
                    <td className="px-4 py-2 text-sm">{String(it.data['UNITS'] ?? '')}</td>
                    <td className="px-4 py-2 text-sm">{String(it.data['quantity'] ?? '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Auction Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 font-medium">Auction Information</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {infoLeft.map(([k,v]) => (
              <div key={k}>
                <div className="text-xs uppercase tracking-wide text-gray-500">{k}</div>
                <div className="mt-1 text-sm">{v}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {infoRight.map(([k,v]) => (
              <div key={k}>
                <div className="text-xs uppercase tracking-wide text-gray-500">{k}</div>
                <div className="mt-1 text-sm">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Purchase Orders */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 font-medium">Purchase Orders</h3>
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">PO00028 {statusToBadge('ACCEPTED')}</div>
              <div className="text-xs text-gray-500">Purchase Order for Auction {rfqId}</div>
            </div>
            <Button size="sm" variant="outline">View</Button>
          </div>
          <div className="mt-3 text-xs text-gray-500">01/01/1970</div>
        </div>
      </div>
    </div>
  );
}
