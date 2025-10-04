import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Button from '../../components/ui/button/Button';
import Badge from '../../components/ui/badge/Badge';
import PageHeader from '../../components/ui/page-header/PageHeader';
import { Input } from '../../components/ui/input';
import { 
  useGetRFQDetailsApi,
  useGetRFQComparisonDataApi,
  useGetRFQItemsApi,
  useAddRfqCollectiveReviseOfferApi,
  useCollectiveArcReportsActionApi
} from '../../hooks/API/RFQApi';
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Search, 
  Download,
  Send,
  CheckCircle,
  Package,
  DollarSign,
  Percent
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { VendorOffer } from '../../Typings/RFQTypes';

interface ComparisonItem {
  id: string;
  name: string;
  rfqItemId: string;
  itemCode: string;
  itemTag?: string;
}

const RFQComparison: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rfqId = searchParams.get('id');
  
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [visibleRows, setVisibleRows] = useState(5);
  const [offerType, setOfferType] = useState<'percentage' | 'price'>('price');
  const [offerPrices, setOfferPrices] = useState<Record<string, Record<string, { price: number; rfqItemId: string }>>>({});
  const [priorityVendors, setPriorityVendors] = useState<Record<string, Record<string, number>>>({});
  const [priorityRemarks, setPriorityRemarks] = useState<Record<string, Record<string, string>>>({});
  const [collectedArcApprovals, setCollectedArcApprovals] = useState<Record<string, any[]>>({});
  const [collectedOffers, setCollectedOffers] = useState<Record<string, Record<string, { price: number; rfqItemId: string }>>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);

  // API hooks
  const { data: rfqDetails, isLoading: isLoadingDetails } = useGetRFQDetailsApi(rfqId!);
  const { data: comparisonData, isLoading: isLoadingComparison } = useGetRFQComparisonDataApi(rfqId!);
  const { data: itemsData, isLoading: isLoadingItems } = useGetRFQItemsApi(rfqId!);
  
  // Initialize API hooks
  const addRfqCollectiveReviseOffer = useAddRfqCollectiveReviseOfferApi();
  const sendForCollectiveArcApproval = useCollectiveArcReportsActionApi();

  // Check if RFQ is expired
  useEffect(() => {
    if (rfqDetails?.technicalSpec?.endDate) {
      const endDate = new Date(rfqDetails.technicalSpec.endDate);
      const now = new Date();
      setIsExpired(endDate < now);
    }
  }, [rfqDetails]);

  // Tabs for different item categories
  const tabs = useMemo(() => [
    {
      label: 'All',
      data: itemsData?.allItems?.items?.map((item: any) => ({
        id: item.item.id,
        name: item.item.MasterGeneric?.name || item.item.itemName,
        rfqItemId: item.id,
        itemCode: item.item.itemCode,
        itemTag: item.item.itemTag,
      })) || [],
    },
    {
      label: 'Counter Offered',
      data: itemsData?.counterOfferedItems?.items?.map((item: any) => ({
        id: item.item.id,
        name: item.item.MasterGeneric?.name || item.item.itemName,
        rfqItemId: item.id,
        itemCode: item.item.itemCode,
        itemTag: item.item.itemTag,
      })) || [],
    },
    {
      label: 'Action Pending',
      data: itemsData?.actionPendingItems?.items?.map((item: any) => ({
        id: item.item.id,
        name: item.item.MasterGeneric?.name || item.item.itemName,
        rfqItemId: item.id,
        itemCode: item.item.itemCode,
        itemTag: item.item.itemTag,
      })) || [],
    },
    {
      label: 'Sent ARC',
      data: itemsData?.sentArcItems?.items?.map((item: any) => ({
        id: item.item.id,
        name: item.item.MasterGeneric?.name || item.item.itemName,
        rfqItemId: item.id,
        itemCode: item.item.itemCode,
        itemTag: item.item.itemTag,
      })) || [],
    },
  ], [itemsData]);

  const filteredItems = useMemo(() => {
    return tabs[currentTab].data.filter((item: ComparisonItem) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tabs, currentTab, searchQuery]);

  const currentItem = filteredItems[currentItemIndex];

  // Navigation functions
  const handlePrevClick = () => {
    setCurrentItemIndex((prev) => {
      const newIndex = prev > 0 ? prev - 1 : filteredItems.length - 1;
      scrollToItem(newIndex);
      return newIndex;
    });
  };

  const handleNextClick = () => {
    setCurrentItemIndex((prev) => {
      const newIndex = prev < filteredItems.length - 1 ? prev + 1 : 0;
      scrollToItem(newIndex);
      return newIndex;
    });
  };

  const scrollToItem = (index: number) => {
    if (sliderRef.current) {
      const itemWidth = sliderRef.current.children[0]?.getBoundingClientRect().width || 120;
      const scrollPosition = index * (itemWidth + 16);
      sliderRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleItemClick = (_item: ComparisonItem, index: number) => {
    setCurrentItemIndex(index);
  };

  // Get vendor offers for current item
  const getVendorOffersForItem = (itemId: string): VendorOffer[] => {
    if (!comparisonData?.topVendors) return [];
    
    return comparisonData.topVendors.filter((vendor: VendorOffer) =>
      vendor.itemOffers?.some(offer => offer.rfqItemId === itemId)
    ).slice(0, visibleRows);
  };

  const currentVendorOffers = currentItem ? getVendorOffersForItem(currentItem.id) : [];

  // Handle offer price change
  const handleOfferPriceChange = (vendorId: string, itemId: string, rfqItemId: string, value: string, costPrice: number) => {
    const numValue = Number(value);
    
    if (offerType === 'percentage') {
      if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        toast.error('Percentage must be between 0 and 100.');
        return;
      }
    }
    
    if (offerType === 'price' && (isNaN(numValue) || numValue < 0)) {
      toast.error('Price cannot be negative.');
      return;
    }
    
    if (numValue > costPrice) {
      toast.error('Price cannot be greater than cost price.');
      return;
    }

    setOfferPrices((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [vendorId]: { price: numValue, rfqItemId },
      },
    }));
  };

  // Handle priority change
  const handlePriorityChange = (vendorId: string, priority: string, remark: string) => {
    const selectedPriority = Number(priority);
    const currentItemId = currentItem?.id || '';

    setPriorityVendors((prev) => ({
      ...prev,
      [currentItemId]: {
        ...(prev[currentItemId] || {}),
        [vendorId]: selectedPriority,
      },
    }));

    setPriorityRemarks((prev) => ({
      ...prev,
      [currentItemId]: {
        ...(prev[currentItemId] || {}),
        [vendorId]: remark,
      },
    }));
  };

  // Handle counter offer
  const handleInitiateCounterOffer = async () => {
    if (!currentItem) {
      toast.error('Please select a product.');
      return;
    }

    const currentItemOffers = offerPrices[currentItem.id] || {};
    if (Object.keys(currentItemOffers).length === 0) {
      toast.error('Please enter counter offer prices for the selected item.');
      return;
    }

    // Add to collected offers
    setCollectedOffers((prev) => ({
      ...prev,
      [currentItem.id]: currentItemOffers,
    }));

    toast.success('Successfully added to counter offer collection!');
  };

  // Handle remove from counter
  const handleRemoveFromCounter = () => {
    if (!currentItem) {
      toast.error('Please select a product.');
      return;
    }

    // Remove from collected offers
    setCollectedOffers((prev) => {
      const newOffers = { ...prev };
      delete newOffers[currentItem.id];
      return newOffers;
    });

    // Clear offer prices for this item
    setOfferPrices((prev) => {
      const newOffers = { ...prev };
      delete newOffers[currentItem.id];
      return newOffers;
    });

    toast.success('Successfully removed from counter offer collection!');
  };

  // Handle collective counter offer
  const handleCollectiveCounterOffer = async () => {
    try {
      if (Object.keys(collectedOffers).length === 0) {
        toast.error('No counter offers collected!');
        return;
      }

      const vendorOffers = Object.entries(collectedOffers).reduce(
        (acc, [itemId, vendors]) => {
          Object.entries(vendors).forEach(([vendorId, offer]) => {
            let vendorOffer = acc.find(
              (vo) => vo.vendorId === vendorId && vo.rfqEventId === rfqId
            );
            if (!vendorOffer) {
              vendorOffer = {
                vendorId,
                rfqEventId: rfqId!,
                revisedItemPrices: [],
              };
              acc.push(vendorOffer);
            }
            vendorOffer.revisedItemPrices.push({
              rfqItemId: offer.rfqItemId,
              revisedCostPrice: offer.price,
              revisionRemarks: priorityRemarks[itemId]?.[vendorId] || `Collective counter offer for item ${itemId}`,
            });
          });
          return acc;
        },
        [] as { vendorId: string; rfqEventId: string; revisedItemPrices: { rfqItemId: string; revisedCostPrice: number; revisionRemarks: string }[] }[]
      );

      if (vendorOffers.length === 0) {
        toast.error('Please enter at least one counter offer price.');
        return;
      }

      // Call the collective counter offer API
      await addRfqCollectiveReviseOffer.mutateAsync({ vendorOffers });
      
      toast.success('Collective counter offers initiated successfully!');
      setCollectedOffers({});
      setOfferPrices({});
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to initiate collective counter offers.');
    }
  };

  // Handle ARC approval
  const handleAddToArcApproval = async () => {
    if (!currentItem) {
      toast.error('Please select a product.');
      return;
    }

    const vendorsForItem = currentVendorOffers;
    if (vendorsForItem.length === 0) {
      toast.error('No vendors found for the selected item.');
      return;
    }

    // Sort vendors by priority to get the top priority vendor
    const sortedVendors = vendorsForItem.sort((a, b) => {
      const rankA = priorityVendors[currentItem.id]?.[a.vendorId] || a.preferedVendor || 999;
      const rankB = priorityVendors[currentItem.id]?.[b.vendorId] || b.preferedVendor || 999;
      return rankA - rankB;
    });

    const selectedVendor = sortedVendors; // Get all vendors for this item
    const collectedArcApprovals: { vendorOfferId: string; rfqItemId: string; rank: number; preferedVendorRank: number; remarks: string }[] = [];
    
    selectedVendor.forEach((vendor) => {
      collectedArcApprovals.push({
        vendorOfferId: vendor.id,
        rfqItemId: currentItem.rfqItemId,
        rank: vendor.rank,
        preferedVendorRank: priorityVendors[currentItem.id]?.[vendor.vendorId] || vendor.preferedVendor,
        remarks: priorityRemarks[currentItem.id]?.[vendor.vendorId] || 'No remarks provided',
      });
    });

    setCollectedArcApprovals((prev) => ({
      ...prev,
      [currentItem.id]: collectedArcApprovals,
    }));

    toast.success('Added to ARC approval collection!');
  };

  // Handle remove from ARC approval
  const handleRemoveFromArcApproval = () => {
    if (!currentItem) {
      toast.error('Please select a product.');
      return;
    }

    setCollectedArcApprovals((prev) => {
      const newState = { ...prev };
      delete newState[currentItem.id];
      return newState;
    });
    toast.success('Removed from ARC approval collection!');
  };

  // Handle collective ARC approval
  const handleCollectiveArcApproval = async () => {
    try {
      if (Object.keys(collectedArcApprovals).length === 0) {
        toast.error('No ARC approvals collected!');
        return;
      }

      const itemsWithTopVendors = Object.values(collectedArcApprovals).flatMap(item => item.map(item => ({
        vendorOfferId: item.vendorOfferId,
        rfqItemId: item.rfqItemId,
        rank: item.rank,
        preferedVendorRank: item.preferedVendorRank,
        remarks: item.remarks,
      })));
      const rfqItemIds = Object.values(collectedArcApprovals).flatMap(item => item.map(item => item.rfqItemId));

      if (itemsWithTopVendors.length === 0 || rfqItemIds.length === 0) {
        toast.error('Please select at least one item for ARC approval.');
        return;
      }

      // Call the collective ARC approval API
      await sendForCollectiveArcApproval.mutateAsync({
        itemsWithTopVendors: itemsWithTopVendors.flat(),
        rfqItemIds: rfqItemIds,
        rfqEventId: rfqId,
        approvedById: 'current-user-id', // TODO: Get from auth context
      });

      toast.success('Collective ARC approval sent successfully!');
      setCollectedArcApprovals({});
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send collective ARC approval.');
    }
  };

  if (isLoadingDetails || isLoadingComparison || isLoadingItems) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!rfqDetails) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">RFQ Not Found</h3>
        <p className="text-gray-500 mb-4">The requested RFQ could not be found.</p>
        <Button onClick={() => navigate('/rfq')}>
          Back to RFQ List
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader 
        title="RFQ Comparison"
        subtitle={`${rfqDetails.eventCode} - ${rfqDetails.title}`}
        showBackButton={true}
      >
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </PageHeader>

      {/* Search and Filter Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={visibleRows}
                onChange={(e) => setVisibleRows(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={3}>Top 3</option>
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 border-b border-gray-200">
            {tabs.map((tab, index) => (
              <button
                key={index}
                className={`pb-2 px-4 text-sm font-medium ${
                  currentTab === index
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => {
                  setCurrentTab(index);
                  setCurrentItemIndex(0);
                }}
              >
                {tab.label} ({tab.data.length})
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Item Navigation */}
      {filteredItems.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevClick}
                disabled={filteredItems.length === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div
                ref={sliderRef}
                className="flex space-x-4 overflow-x-auto flex-1 scrollbar-hide"
                style={{ scrollBehavior: 'smooth' }}
              >
                {filteredItems.map((item: ComparisonItem, index: number) => (
                  <div
                    key={item.id}
                    className={`relative text-black justify-center rounded-md shadow-md p-3 cursor-pointer min-w-[120px] max-w-[120px] ${
                      currentItemIndex === index
                        ? 'border-2 border-blue-500 bg-blue-600 text-white'
                        : collectedArcApprovals[item.id]
                        ? 'border-2 border-purple-500 bg-purple-100'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => handleItemClick(item, index)}
                  >
                    <div className="text-sm font-medium truncate" title={item.name}>
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate" title={item.itemCode}>
                      {item.itemCode}
                    </div>
                    {collectedOffers[item.id] && Object.keys(collectedOffers[item.id]).length > 0 && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                        ✓
                      </div>
                    )}
                    {collectedArcApprovals[item.id] && (
                      <div className="absolute top-1 left-1 bg-purple-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                        ARC
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextClick}
                disabled={filteredItems.length === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Table */}
      {currentItem && currentVendorOffers.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Price Comparison - {currentItem.itemCode}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {currentItem.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {currentItem.itemTag && (
                  <Badge variant="light" color="warning" size="sm">
                    {currentItem.itemTag === 'COST_BASED' ? 'CB' : 'MB'}
                  </Badge>
                )}
                {isExpired && (
                  <Badge variant="light" color="error" size="sm">
                    Expired
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-300">
                <tbody>
                  {/* Vendor Names Row */}
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                      Vendor Name
                    </th>
                    {currentVendorOffers.map((vendor) => (
                      <td key={vendor.vendorId} className="border border-gray-300 px-4 py-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{vendor.vendor.companyName}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              P{vendor.preferedVendor}
                            </span>
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Vendor Codes Row */}
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                      Vendor Code
                    </th>
                    {currentVendorOffers.map((vendor) => (
                      <td key={vendor.vendorId} className="border border-gray-300 px-4 py-2">
                        {vendor.vendor.vendorCode}
                      </td>
                    ))}
                  </tr>

                  {/* Brand Names Row */}
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                      Brand Name
                    </th>
                  {currentVendorOffers.map((vendor) => (
                    <td key={vendor.vendorId} className="border border-gray-300 px-4 py-2">
                      {vendor.itemOffers?.[0]?.brandName || 'N/A'}
                    </td>
                  ))}
                  </tr>

                  {/* Status Row */}
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                      Status
                    </th>
                    {currentVendorOffers.map((vendor) => (
                      <td key={vendor.vendorId} className="border border-gray-300 px-4 py-2">
                        <Badge 
                          variant="light" 
                          color={
                            vendor.itemOffers?.[0]?.status === 'ACCEPTED' ? 'success' :
                            vendor.itemOffers?.[0]?.status === 'COUNTER_OFFER' ? 'primary' :
                            vendor.itemOffers?.[0]?.status === 'ACTION_PENDING' ? 'warning' : 'primary'
                          } 
                          size="sm"
                        >
                          {vendor.itemOffers?.[0]?.status || 'N/A'}
                        </Badge>
                      </td>
                    ))}
                  </tr>

                  {/* Current Cost Price Row */}
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                      Current Cost Price
                    </th>
                  {currentVendorOffers.map((vendor) => (
                    <td key={vendor.vendorId} className="border border-gray-300 px-4 py-2">
                      <span className="font-medium">
                        ₹{vendor.itemOffers?.[0]?.costPrice?.toLocaleString() || '0'}
                      </span>
                    </td>
                  ))}
                  </tr>

                  {/* MRP Row */}
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                      MRP
                    </th>
                  {currentVendorOffers.map((vendor) => (
                    <td key={vendor.vendorId} className="border border-gray-300 px-4 py-2">
                      ₹{vendor.itemOffers?.[0]?.MRP?.toLocaleString() || '0'}
                    </td>
                  ))}
                  </tr>

                  {/* Margin Amount Row */}
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                      Margin Amount
                    </th>
                  {currentVendorOffers.map((vendor) => (
                    <td key={vendor.vendorId} className="border border-gray-300 px-4 py-2">
                      ₹{Math.round((vendor.itemOffers?.[0]?.MRP || 0) - (vendor.itemOffers?.[0]?.costPrice || 0))}
                    </td>
                  ))}
                  </tr>

                  {/* Margin Percentage Row */}
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                      Margin %
                    </th>
                  {currentVendorOffers.map((vendor) => (
                    <td key={vendor.vendorId} className="border border-gray-300 px-4 py-2">
                      {vendor.itemOffers?.[0]?.MRP && vendor.itemOffers?.[0]?.costPrice
                        ? `${(((vendor.itemOffers[0].MRP - vendor.itemOffers[0].costPrice) / vendor.itemOffers[0].MRP) * 100).toFixed(2)}%`
                        : 'N/A'}
                    </td>
                  ))}
                  </tr>

                  {/* Counter Offer Price Row */}
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                      <div className="space-y-2">
                        <div>Counter Offer Price</div>
                        <div className="flex items-center gap-4 text-xs">
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name="offerType"
                              value="percentage"
                              checked={offerType === 'percentage'}
                              onChange={() => setOfferType('percentage')}
                            />
                            <Percent className="h-3 w-3" />
                            Percentage
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="radio"
                              name="offerType"
                              value="price"
                              checked={offerType === 'price'}
                              onChange={() => setOfferType('price')}
                            />
                            <DollarSign className="h-3 w-3" />
                            Price
                          </label>
                        </div>
                      </div>
                    </th>
                    {currentVendorOffers.map((vendor) => (
                      <td key={vendor.vendorId} className="border border-gray-300 px-4 py-2">
                        {vendor.itemOffers?.[0]?.status === 'ACCEPTED' ? (
                          <Badge variant="light" color="success" size="sm">
                            Accepted
                          </Badge>
                        ) : (
                          <Input
                            type="number"
                            className="w-full"
                            placeholder={`Enter ${offerType === 'percentage' ? 'percentage' : 'price'}`}
                            disabled={isExpired}
                            value={offerPrices[currentItem.id]?.[vendor.vendorId]?.price || ''}
                            onChange={(e) =>
                              handleOfferPriceChange(
                                vendor.vendorId,
                                currentItem.id,
                                vendor.itemOffers?.[0]?.rfqItemId || '',
                                e.target.value,
                                vendor.itemOffers?.[0]?.costPrice || 0
                              )
                            }
                          />
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Priority Vendor Row */}
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                      Priority Vendor
                    </th>
                    {currentVendorOffers.map((vendor) => (
                      <td key={vendor.vendorId} className="border border-gray-300 px-4 py-2">
                        <div className="space-y-2">
                          <select
                            className="w-full border rounded px-2 py-1 text-sm"
                            value={priorityVendors[currentItem.id]?.[vendor.vendorId] || vendor.preferedVendor}
                            onChange={(e) => handlePriorityChange(vendor.vendorId, e.target.value, priorityRemarks[currentItem.id]?.[vendor.vendorId] || '')}
                            disabled={isExpired}
                          >
                            <option value={1}>P1</option>
                            <option value={2}>P2</option>
                            <option value={3}>P3</option>
                          </select>
                          <Input
                            type="text"
                            className="w-full text-sm"
                            placeholder="Enter priority remark"
                            disabled={isExpired}
                            value={priorityRemarks[currentItem.id]?.[vendor.vendorId] || ''}
                            onChange={(e) => {
                              setPriorityRemarks((prev) => ({
                                ...prev,
                                [currentItem.id]: {
                                  ...(prev[currentItem.id] || {}),
                                  [vendor.vendorId]: e.target.value,
                                },
                              }));
                            }}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Collected Items Summary */}
            {(Object.keys(collectedOffers).length > 0 || Object.keys(collectedArcApprovals).length > 0) && (
              <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Collected:</strong> {Object.keys(collectedOffers).length} counter offers, {Object.keys(collectedArcApprovals).length} ARC approvals
                </div>
                {Object.keys(collectedArcApprovals).length > 0 && (
                  <div className="text-xs text-purple-600">
                    <strong>ARC Items:</strong> {Object.keys(collectedArcApprovals).map(itemId => {
                      const item = filteredItems.find((card: any) => card.id === itemId);
                      return item?.name;
                    }).filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {!isExpired && (
              <div className="mt-6 space-y-4">
                {/* Individual Item Actions */}
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Button
                      onClick={handleInitiateCounterOffer}
                      disabled={Object.keys(offerPrices[currentItem.id] || {}).length === 0}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Add to Counter
                    </Button>
                    <Button
                      onClick={handleRemoveFromCounter}
                      disabled={!collectedOffers[currentItem.id]}
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      Remove from Counter
                    </Button>
                    <Button
                      onClick={collectedArcApprovals[currentItem.id] ? handleRemoveFromArcApproval : handleAddToArcApproval}
                      variant="outline"
                      className={`${collectedArcApprovals[currentItem.id] ? 'border-red-500 text-red-600 hover:bg-red-50' : 'border-purple-500 text-purple-600 hover:bg-purple-50'}`}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {collectedArcApprovals[currentItem.id] ? 'Remove from ARC Approval' : 'Add to ARC Approval'}
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </div>

                {/* Collective Actions */}
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCollectiveCounterOffer}
                      disabled={Object.keys(collectedOffers).length === 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Collectively Initiate Counter Offers
                    </Button>
                    <Button
                      onClick={handleCollectiveArcApproval}
                      disabled={Object.keys(collectedArcApprovals).length === 0}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Collectively Send for ARC Approval
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Found</h3>
            <p className="text-gray-500">No items match your current filter criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RFQComparison;
