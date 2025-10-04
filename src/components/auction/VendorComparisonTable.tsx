import React from 'react';
import { IndianRupee } from 'lucide-react';

interface BidItem {
  id: string;
  rate: number;
  price: number;
  tax: number;
  taxPercent: number;
  finalPrice: number;
  auctionItemId: string;
  auctionItem: {
    id: string;
    itemsSheetId: string;
    data: {
      Name: string;
      isEdit: boolean;
      quantity: number;
      isPreferred: boolean;
    };
  };
}

interface BidRecord {
  id: string;
  bidAmount: number;
  bidPercentage: number;
  count: number;
  createdAt: string;
  bidItems: BidItem[];
}

interface Participant {
  id: string;
  name: string;
  vendor: {
    id: string;
    vendorCode: string;
    tempName: string;
    tempCompanyName: string;
  };
  bidRecords: BidRecord[];
}

// Using the imported type from AuctionTypes
import type { ItemSheet as AuctionItemSheet } from '../../Typings/AuctionTypes';

interface ItemSheet extends Omit<AuctionItemSheet, 'items'> {
  items: Array<{
    id: string;
    data: Record<string, any> & { Name?: string };
  }>;
}

interface VendorComparisonTableProps {
  participants: Participant[];
  sheets: ItemSheet[];
}

const VendorComparisonTable: React.FC<VendorComparisonTableProps> = ({ participants = [], sheets = [] }) => {
  // Filter out participants with no bid records
  const vendorsWithBids = (participants || []).filter(
    (participant) => participant?.bidRecords?.length > 0
  );

  if (!vendorsWithBids.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No bid data available for comparison
      </div>
    );
  }

  // Function to calculate the sum of all items in a bid record for a specific sheet
  const calculateSheetTotal = (bidRecord: BidRecord | undefined, sheetId: string) => {
    if (!bidRecord?.bidItems?.length) return 0;
    return bidRecord.bidItems
      .filter(item => item?.auctionItem?.itemsSheetId === sheetId)
      .reduce((sum, item) => sum + (item?.finalPrice || 0), 0);
  };

  // Function to get first and last bid totals for a vendor and sheet
  const getBidInfo = (vendor: Participant, sheetId: string) => {
    if (!vendor?.bidRecords?.length) return { firstBid: null, lastBid: null };
    
    const bidsForSheet = vendor.bidRecords
      .filter(record => 
        record?.bidItems?.some(item => item?.auctionItem?.itemsSheetId === sheetId)
      )
      .sort((a, b) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime());

    if (!bidsForSheet.length) return { firstBid: null, lastBid: null };

    const firstBid = {
      total: calculateSheetTotal(bidsForSheet[0], sheetId),
      createdAt: bidsForSheet[0]?.createdAt || new Date().toISOString()
    };

    const lastBid = {
      total: calculateSheetTotal(bidsForSheet[bidsForSheet.length - 1], sheetId),
      createdAt: bidsForSheet[bidsForSheet.length - 1]?.createdAt || new Date().toISOString()
    };

    return { firstBid, lastBid };
  };

  if (!sheets?.length) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No sheets available for comparison
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {sheets.map((sheet) => (
        <div key={sheet.id} className="mb-8">
          <h3 className="text-lg font-semibold mb-4">{sheet.name}</h3>
          <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    First Bid Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Bid Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Difference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Items
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {vendorsWithBids.map((vendor) => {
                  const { firstBid, lastBid } = getBidInfo(vendor, sheet.id);
                  
                  if (!firstBid || !lastBid) return null;

                  const firstTotal = firstBid?.total || 0;
                  const lastTotal = lastBid?.total || 0;
                  const difference = firstTotal > 0 
                    ? ((lastTotal - firstTotal) / firstTotal * 100).toFixed(2)
                    : '0.00';
                  const isDecrease = lastTotal < firstTotal;
                  const itemCount = (vendor.bidRecords?.[0]?.bidItems || [])
                    .filter(item => item?.auctionItem?.itemsSheetId === sheet.id)
                    .length || 0;

                  return (
                    <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {vendor.vendor?.tempName || vendor.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {vendor.vendor?.tempCompanyName || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          <span>{firstBid.total.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(firstBid.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          <span>{lastBid.total.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(lastBid.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${isDecrease ? 'text-green-600' : 'text-red-600'}`}>
                        {isDecrease ? '↓' : '↑'} {Math.abs(Number(difference))}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {itemCount} items
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VendorComparisonTable;
