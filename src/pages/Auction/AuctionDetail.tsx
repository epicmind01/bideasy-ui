import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Button from '../../components/ui/button/Button';
import PageHeader from '../../components/ui/page-header/PageHeader';
import { 
  FileText, 
  Users, 
  Clock,
  CheckCircle, 
  XCircle, 
  User, 
  IndianRupee,
  UserIcon
} from 'lucide-react';
import { useGetAuctionByIdApi, useNotifyVendorToAuctionApi } from '../../hooks/API/AuctionApi';
import { formatIndianCurrency,  calculateTimeLeft, formatTimeLeft, formatAuctionDate } from "../../utils/Helpers";

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
  const auction = auctionResponse?.auction;
  const [activeTab, setActiveTab] = useState('details');
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [items, setItems] = useState(auction?.itemsSheets?.[0]?.items || []);
  const [headers, setHeaders] = useState(auction?.itemsSheets?.[0]?.itemHeaders || []);
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());
  const notifyVendors = useNotifyVendorToAuctionApi();
  const navigate = useNavigate();
  const handleVendorSelect = (participantId: string) => {
    setSelectedVendors(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(participantId)) {
        newSelection.delete(participantId);
      } else {
        newSelection.add(participantId);
      }
      return newSelection;
    });
  };

  const handleSelectAllVendors = (checked: boolean) => {
    if (!auction?.participants) return;
    
    setSelectedVendors(checked 
      ? new Set(auction.participants.map(p => p.id))
      : new Set()
    );
  };

  const handleInviteSelectedVendors = async () => {
    if (!id || selectedVendors.size === 0 || !auction?.participants) return;
    
    // Get vendor IDs from selected participants
    const vendorIds = Array.from(selectedVendors).map(participantId => {
      const participant = auction.participants?.find(p => p.id === participantId);
      return participant?.vendor?.id;
    }).filter(Boolean) as string[]; // Filter out any undefined values

    if (vendorIds.length === 0) return;
    
    try {
      await notifyVendors.mutateAsync({
        auctionId: id,
        vendorIds: vendorIds
      });
      // Clear selection after successful invite
      setSelectedVendors(new Set());
      // You might want to add a success toast here
    } catch (error) {
      console.error('Failed to invite vendors:', error);
      // You might want to show an error toast here
    }
  };

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
          { label: 'Dashboard', href: '/' },
          { label: 'Auctions', href: '/auction' },
          { label: auction.name, active: true }
        ]}
        showBackButton={true}
        backButtonText="Back to Auctions"
        className="mb-6"
      >
        <div className="flex flex-wrap gap-2 mt-4 sm:mt-0 sm:ml-auto">
          <Button onClick={() => navigate(`/auction/${auction.id}/live`)} variant="outline" size="sm" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            Live
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
              <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
            </svg>
            Communication
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
            Auction Details
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'participants'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'
            }`}
          >
            Participants ({participantCount})
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'items'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'
            }`}
          >
            BOQ ({itemCount})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
              activeTab === 'terms'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'
            }`}
          >
            Terms & Conditions
          </button>
          
            <button
              onClick={() => setActiveTab('purchase-order')}
              className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
                activeTab === 'purchase-order'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300'
              }`}
            >
              Purchase Order ({auction.purchaseOrder?.length || 0})
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
              <h3 className="mb-4 text-lg font-medium">Auction Information</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Event Category
                      </div>
                      <div className="mt-1 text-base">{auction.auctionCategory?.name}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Business Department
                      </div>
                      <div className="mt-1 text-base">{auction.BusinessDepartment}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Does Item Have First Quote ?
                      </div>
                      <div className="mt-1 text-base">{auction.auctionInfo?.itemHasFirstQuote ?'YES':"NO"}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      The Bidder Can Bid Against ?
                      </div>
                      <div className="mt-1 text-base">{auction.auctionInfo?.bidderCanBidAgainst}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Minimum Bid Difference Other Contractotors Price
                      </div>
                      <div className="mt-1 text-base">{auction.auctionInfo?.minBidDifferenceContractors ? formatIndianCurrency(auction.auctionInfo?.minBidDifferenceContractors) : " - "}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Enable Max Bid Difference
                      </div>
                      <div className="mt-1 text-base">{auction.auctionInfo?.maxBidDifferenceEnabled ?'YES':"NO"}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Reserved Buying/Sealing Price
                      </div>
                      <div className="mt-1 text-base">{auction.auctionInfo?.reserveBuyingSellingPrice ? formatIndianCurrency(auction.auctionInfo?.reserveBuyingSellingPrice) : " - "}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Display Of Participation Rank?
                      </div>
                      <div className="mt-1 text-base">{auction.auctionInfo?.displayLeadingPriceToVendors?'YES':"NO"}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Should the Vendor bid Price be Masked for Buyers?
                      </div>
                      <div className="mt-1 text-base">{auction.auctionInfo?.maskVendorCompanyNames ?'YES':"NO"}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Winner Annoucemnt after Auction End?
                      </div>
                      <div className="mt-1 text-base">{auction.winnerAnnounced}</div>
                    </div>

                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Start Time
                      </div>
                      <div className="mt-1 text-base">{formatAuctionDate(auction.startTime)}</div>
                    </div>

                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      End Time
                      </div>
                      <div className="mt-1 text-base">{formatAuctionDate(auction.extendTime)}</div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                          Plant 
                      </div>
                      <div className="mt-1 text-base">{auction.plant?.name}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Auction Behavior 
                      </div>
                      <div className="mt-1 text-base">{auction.auctionBehavior}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Display Leading Price To Vendors 
                      </div>
                      <div className="mt-1 text-base">{auction.auctionInfo?.displayLeadingPriceToVendors ?'YES':"NO"}</div>
                    </div>

                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Minimum Bid Difference Self Price 
                      </div>
                      <div className="mt-1 text-base">{auction.auctionInfo?.minBidDifference ? formatIndianCurrency(auction.auctionInfo?.minBidDifference) : " -  "}</div>
                    </div>

                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Max Bid Difference Price 
                      </div>
                      <div className="mt-1 text-base">{auction.auctionInfo?.maxBidDifferencePrice ? formatIndianCurrency(auction.auctionInfo?.maxBidDifferencePrice) : " -  "}</div>
                    </div>

                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Should There Be A Reserved Buying/Sealing 
                      </div>
                      <div className="mt-1 text-base">{auction.auctionInfo?.reservedBuyingSelling}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Single Bid
                      </div>
                      <div className="mt-1 text-base">{auction.auctionInfo?.singleBidEnabled ?'YES':"NO"}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Should The vendor company names be Masked for Buyers?
                      </div>
                      <div className="mt-1 text-base">{auction.auctionInfo?.maskVendorCompanyNames ?'YES':"NO"}</div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                          Observers
                      </div>
                      <div className="mt-1 text-base">
                        {auction.observers?.map((observer: any) => observer.observer?.name).filter(Boolean).join(", ") || '-'}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Co Creators
                      </div>
                      <div className="mt-1 text-base">
                        {auction.coCreators?.map((creator: any) => creator?.buyer?.name).filter(Boolean).join(", ") || '-'}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Auto Extension
                      </div>
                      <div className="mt-1 text-base">{auction.autoExtension?'YES':'NO'}</div>
                    </div>
                    {auction?.autoExtension && (
                      <div className="col-span-1">  
                        <div className="text-xs font-medium uppercase tracking-wider text-gray-500">
                          Auto Extension Settings  
                        </div>
                        <div className="mt-1 text-base">If vendor bids in last {auction.extension} minutes then extend by {auction.lastBidExtension} minutes Overall extension limit to {auction.overallExtension} minutes</div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">Participants</h3>
              <div>
                <Button 
                  onClick={handleInviteSelectedVendors}
                  disabled={selectedVendors.size === 0}
                  variant="primary"
                  size="sm"
                  className="ml-auto"
                >
                  Invite Selected ({selectedVendors.size})
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="w-10 px-2 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedVendors.size > 0 && selectedVendors.size === auction?.participants?.length}
                        onChange={(e) => handleSelectAllVendors(e.target.checked)}
                      />
                    </th>
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
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Auction Result</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {auction.participants?.map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="whitespace-nowrap px-2 py-4">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedVendors.has(participant.id)}
                          onChange={() => handleVendorSelect(participant.id)}
                        />
                      </td>
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
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {participant.auctionResult}
                      </div>
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

        {activeTab === 'documents' && (
          <>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium">Auction Documents</h3>
            {auction.eventDocuments && auction.eventDocuments.length > 0 ? (
              <div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                  {auction.eventDocuments.map((doc) => (
                    <li key={doc.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <FileText className="h-10 w-10 text-gray-400" aria-hidden="true" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {doc.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {doc.size} • {doc.type}
                            </p>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-md bg-gray-50 p-4 text-center dark:bg-gray-700">
                <FileText className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No documents</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No documents have been uploaded for this auction.
                </p>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium">Co Creators</h3>
            {auction.coCreators && auction.coCreators.length > 0 ? (
              <div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                  {auction.coCreators.map((creator) => (
                    <li key={creator.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <UserIcon className="h-10 w-10 text-gray-400" aria-hidden="true" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {creator.buyer?.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {creator.buyer?.email}
                            </p>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <a
                            href={`mailto:${creator.buyer?.email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Contact
                          </a>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-md bg-gray-50 p-4 text-center dark:bg-gray-700">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No co-creators</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No co-creators have been added for this auction.
                </p>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium">Observers</h3>
            {auction.observers && auction.observers.length > 0 ? (
              <div className="overflow-hidden shadow ring-1 ring-black/5 sm:rounded-lg">
                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                  {auction.observers.map((observer) => (
                    <li key={observer.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <UserIcon className="h-10 w-10 text-gray-400" aria-hidden="true" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {observer.buyer?.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {observer.buyer?.email}
                            </p>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <a
                            href={`mailto:${observer.buyer?.email}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Contact
                          </a>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-md bg-gray-50 p-4 text-center dark:bg-gray-700">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No observers</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  No observers have been added for this auction.
                </p>
              </div>
            )}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
