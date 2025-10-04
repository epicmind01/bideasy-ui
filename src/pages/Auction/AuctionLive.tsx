import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Button from '../../components/ui/button/Button';
import PageHeader from '../../components/ui/page-header/PageHeader';
import BidGraph from '../../components/auction/BidGraph';
import VendorComparisonTable from '../../components/auction/VendorComparisonTable';
import AuctionSettings from '../../components/auction/AuctionSettings';
import { 
  FileText, 
  Users, 
  Clock,
  CheckCircle, 
  XCircle, 
  User, 
  IndianRupee, 
  UserPlus 
} from 'lucide-react';
import { useGetAuctionByIdApi } from '../../hooks/API/AuctionApi';
import { formatIndianCurrency,  calculateTimeLeft, formatTimeLeft } from "../../utils/Helpers";

// Countdown Timer Component
const CountdownTimer = ({ endDate }: { endDate: string | Date }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endDate));

  useEffect(() => {
    // Update immediately
    setTimeLeft(calculateTimeLeft(endDate));

    // Then update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return <span>{formatTimeLeft(timeLeft)}</span>;
};


interface DetailCardProps {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  description?: string;
  className?: string;
}

const DetailCard: React.FC<DetailCardProps> = ({ 
  icon, 
  title, 
  value, 
  description,
  className = '' 
}) => (
  <div className={`bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-800 ${className}`}>
    <div className="flex items-center space-x-3">
      <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <div className="text-lg font-semibold">
          {typeof value === 'number' && title.toLowerCase().includes('value')
            ? formatIndianCurrency(value)
            : value}
        </div>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
      </div>
    </div>
  </div>
);


  

export default function AuctionDetail() {
  const { id } = useParams();
  const { data: auctionResponse, isLoading, error } = useGetAuctionByIdApi(id);
  console.log(auctionResponse);
  const auction = auctionResponse?.auction;
  const [activeTab, setActiveTab] = useState('details');
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [items, setItems] = useState(auction?.itemsSheets?.[0]?.items || []);
  const [headers, setHeaders] = useState(auction?.itemsSheets?.[0]?.itemHeaders || []);

  // Update items and headers when active sheet changes
  useEffect(() => {
    if (auction?.itemsSheets?.[activeSheetIndex]) {
      setItems(auction.itemsSheets[activeSheetIndex].items || []);
      setHeaders(auction.itemsSheets[activeSheetIndex].itemHeaders || []);
    }
  }, [activeSheetIndex, auction]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading auction details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading auction</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Failed to load auction details. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Auction not found</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">The requested auction could not be found.</p>
      </div>
    );
  }

  const activeSheet = auction.itemsSheets?.[activeSheetIndex];
  const participantCount = auction.participants?.length || 0;
  const itemCount = auction.itemsSheets?.reduce((total, sheet) => total + (sheet.items?.length || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={auction.name}
        subtitle={`#${auction.eventCode} • ${participantCount} Participants • ${itemCount} Items`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Auctions', href: '/auction' },
          { label: auction.name, active: true }
        ]}
        showBackButton={true}
        backButtonText="Back to Auctions"
        className="mb-6"
      >
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 sm:ml-auto">

          <Button variant="primary" size="sm">
            <UserPlus className="mr-2 h-4 w-4" /> Communication
          </Button>
        </div>
      </PageHeader>
      

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'
            }`}
          >
            Auction Detail
          </button>
          <button
            onClick={() => setActiveTab('comparation')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'comparation'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'
            }`}
          >
            Comparation
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DetailCard
                icon={<IndianRupee className="h-5 w-5" />}
                title="Auction Leading Price"
                value={formatIndianCurrency(auction.leadingPrice || 0)}
                description="Total value of all items"
              />
              <DetailCard
                icon={<Users className="h-5 w-5" />}
                title="Participants"
                value={participantCount}
                description="Total vendors participating"
              />
              <DetailCard
                icon={<FileText className="h-5 w-5" />}
                title="Items"
                value={itemCount}
                description="Total items in auction"
              />
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Remaining</h3>
                    <p className="text-lg font-semibold">
                      <CountdownTimer endDate={auction.extendTime} />
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auction ends soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Auction Information */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-medium">Auction Bids</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Bid Graph */}
                    <div className="col-span-full mt-6">
                      <BidGraph 
                        participants={auction.participants || []} 
                        leadingPrice={auction.leadingPrice}
                      />
                    </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                    >
                      Vendor
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                    >
                      Company
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                    >
                      Email
                    </th>
                    
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                    >
                      Response
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                    >
                      Auction Result
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {auction.participants?.map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <User className="h-10 w-10 rounded-full bg-gray-100 p-2 text-gray-400 dark:bg-gray-700" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {participant.vendor?.tempName || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {participant.vendor?.vendorCode || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {participant.vendor?.tempCompanyName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {participant.vendor?.tempCity || ''}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {participant.vendor?.email || 'N/A'}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        {participant.response === 'PENDING' ? (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </span>
                        ) : participant.response === 'ACCEPTED' ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Accepted
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                            <XCircle className="mr-1 h-3 w-3" />
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            participant.auctionResult === 'WON'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {participant.auctionResult.charAt(0) + participant.auctionResult.slice(1).toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-4">
            {/* Sheet Tabs */}
            {auction.itemsSheets && auction.itemsSheets.length > 0 && (
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-2 overflow-x-auto pb-1" aria-label="Tabs">
                  {[...auction.itemsSheets]
                    .map((sheet, idx) => ({
                      ...sheet,
                      originalIndex: idx
                    }))
                    .sort((a, b) => (a.position || 0) - (b.position || 0))
                    .map(({ id, name, items: sheetItems, isEditable, originalIndex }) => {
                      const isActive = activeSheetIndex === originalIndex;
                      return (
                        <button
                          key={id}
                          onClick={() => setActiveSheetIndex(originalIndex)}
                          className={`whitespace-nowrap rounded-t-lg border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                            isEditable === false
                              ? isActive
                                ? 'border-red-500 bg-red-50 text-red-600 dark:border-red-400 dark:bg-red-900/20 dark:text-red-400'
                                : 'border-transparent bg-red-50/70 text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20'
                              : isActive
                              ? 'border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:bg-gray-700/50 dark:hover:text-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {isEditable === false && (
                              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                              </svg>
                            )}
                            <span>{name}</span>
                            <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {sheetItems?.length || 0}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                </nav>
              </div>
            )}

            {/* Active Sheet Content */}
            {activeSheet && (
              <div className={`overflow-hidden rounded-lg border shadow-sm ${
                activeSheet.isEditable === false 
                  ? 'border-red-200 dark:border-red-900/50' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}>
                <div className={`px-4 py-3 sm:px-6 ${
                  activeSheet.isEditable === false 
                    ? 'bg-red-50/50 dark:bg-red-900/10' 
                    : 'bg-white dark:bg-gray-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                        {activeSheet.name}
                      </h3>
                      {activeSheet.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {activeSheet.description}
                        </p>
                      )}
                    </div>
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      {items.length} items
                    </span>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-x-auto border-b border-gray-200 shadow dark:border-gray-700">
                      <table className="w-full table-auto divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="sticky left-0 z-10 w-10 bg-gray-50 px-2 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-gray-700 dark:text-gray-300">
                              #
                            </th>
                            {headers
                              .sort((a, b) => a.position - b.position)
                              .filter(header => !['isEdit', 'isPreferred'].includes(header.name))
                              .map((header) => (
                                <th
                                  key={header.id}
                                  className="whitespace-nowrap px-2 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                >
                                  <div className="flex flex-col">
                                    <span className="truncate">{header.name}</span>
                                    <span className="text-[10px] text-gray-400">{header.type}</span>
                                  </div>
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                          {items.map((item, rowIndex) => (
                            <tr 
                              key={item.id} 
                              className={`${
                                item.data.isEdit === false 
                                  ? 'bg-red-50/50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20' 
                                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              <td className="sticky left-0 z-10 w-10 bg-white px-2 py-2 text-center text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                                {rowIndex + 1}
                              </td>
                              {headers
                                .sort((a, b) => a.position - b.position)
                                .filter(header => !['isEdit', 'isPreferred'].includes(header.name))
                                .map((header) => (
                                  <td
                                    key={`${item.id}-${header.id}`}
                                    className={`whitespace-nowrap px-2 py-2 text-xs ${header.type === 'number' ? 'text-right' : 'text-left'}`}
                                  >
                                    {header.type === 'checkbox' ? (
                                      <div className="flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={!!item.data[header.name]}
                                          readOnly
                                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                                        />
                                      </div>
                                    ) : (
                                      <span className="truncate">
                                        {item.data[header.name] === undefined || item.data[header.name] === '' 
                                          ? <span className="text-gray-400">-</span> 
                                          : String(item.data[header.name])}
                                      </span>
                                    )}
                                  </td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-6">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{items.length}</span> items
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comparation' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium">Vendor Bid Comparison</h3>
            <VendorComparisonTable 
              participants={auction.participants || []}
              sheets={auction.itemsSheets || []}
            />
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium">Terms & Conditions</h3>
            {auction.termsAndConditions ? (
              <div className="prose max-w-none text-gray-600 dark:text-gray-300" 
                   dangerouslySetInnerHTML={{ __html: auction.termsAndConditions }} />
            ) : (
              <div className="rounded-md bg-gray-50 p-4 text-center dark:bg-gray-700">
                <FileText className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No terms & conditions</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No terms and conditions have been added for this auction.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'purchase-order' && auction.purchaseOrder && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Purchase Order</h3>
            </div>
          </div>
        )}

        {activeTab === 'settings' && <AuctionSettings auction={auction} />}
      </div>
    </div>
  );
}
