import React, { useState, useEffect } from 'react';
import { DataTable } from '../../../components/ui/data-table/DataTableFixed';
import { type ColumnDef } from '@tanstack/react-table';
import Badge from '../../../components/ui/badge/Badge';
import type { ArcReportData } from '../../../Typings/ArcReportTypes';

interface ComparativeReviewProps {
  arcRfqItems: any[];
  rfqEventId: string;
  setRfqItemId: React.Dispatch<React.SetStateAction<string>>;
}

interface _VendorOffer {
  id: string;
  costPrice: number;
  vendorOfferId: string;
  rfqItemId: string;
  brandName?: string;
  MRP: number;
  manufacturerName: string;
  gstPercentage: number;
  vendor: {
    details: {
      companyName: string;
    };
  };
}

interface TableRow {
  id: string;
  itemName: string;
  itemCode: string;
  brandName: string;
  vendorName: string;
  rfqPrice: number;
  counterOfferPrice: number;
  mrp: number;
  marginAmount: number;
  savingProfit: number;
  savingPercentage: string;
  status: string;
}

const ComparativeReview: React.FC<ComparativeReviewProps> = ({ 
  arcRfqItems, 
  rfqEventId: _rfqEventId, 
  setRfqItemId 
}) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [loading, _setLoading] = useState(false);

  // Initialize with the first item selected
  useEffect(() => {
    if (arcRfqItems.length > 0 && !selectedItem) {
      const firstItem = arcRfqItems[0];
      setSelectedItem(firstItem);
      setRfqItemId(firstItem.id);
      generateTableData(firstItem);
    }
  }, [arcRfqItems, selectedItem, setRfqItemId]);

  const generateTableData = (item: any) => {
    if (!item || !item.vendors) return;

    const data: TableRow[] = item.vendors.map((vendor: any, index: number) => {
      const rfqPrice = vendor.vendorOffer?.vendorItemOffers?.[0]?.costPrice || 0;
      const counterOfferPrice = vendor.counterOfferPrice || rfqPrice;
      const mrp = vendor.MRP || 0;
      const marginAmount = mrp - counterOfferPrice;
      const savingProfit = rfqPrice - counterOfferPrice;
      const savingPercentage = rfqPrice > 0 ? ((savingProfit / rfqPrice) * 100).toFixed(2) : '0';

      return {
        id: vendor.id || index.toString(),
        itemName: item.rfqItem?.item?.description || 'N/A',
        itemCode: item.rfqItem?.item?.itemCode || 'N/A',
        brandName: vendor.brandName || 'N/A',
        vendorName: vendor.vendorOffer?.vendor?.details?.companyName || 'N/A',
        rfqPrice,
        counterOfferPrice,
        mrp,
        marginAmount,
        savingProfit,
        savingPercentage: `${savingPercentage}%`,
        status: vendor.status || 'PENDING'
      };
    });

    setTableData(data);
  };

  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
    setRfqItemId(item.id);
    generateTableData(item);
  };

  const columns: ColumnDef<TableRow>[] = [
    {
      accessorKey: 'itemName',
      header: 'Item Name',
      cell: ({ row }) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 dark:text-white">
            {row.original.itemName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.itemCode}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'brandName',
      header: 'Brand Name',
      cell: ({ row }) => (
        <span className="text-gray-900 dark:text-white">
          {row.original.brandName}
        </span>
      ),
    },
    {
      accessorKey: 'vendorName',
      header: 'Vendor Name',
      cell: ({ row }) => (
        <span className="text-gray-900 dark:text-white">
          {row.original.vendorName}
        </span>
      ),
    },
    {
      accessorKey: 'rfqPrice',
      header: 'RFQ Price',
      cell: ({ row }) => (
        <span className="text-gray-900 dark:text-white">
          ₹{row.original.rfqPrice.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'counterOfferPrice',
      header: 'Counter Offer',
      cell: ({ row }) => (
        <span className="text-gray-900 dark:text-white">
          ₹{row.original.counterOfferPrice.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'mrp',
      header: 'MRP',
      cell: ({ row }) => (
        <span className="text-gray-900 dark:text-white">
          ₹{row.original.mrp.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'savingProfit',
      header: 'Saving',
      cell: ({ row }) => (
        <span className={`font-medium ${
          row.original.savingProfit > 0 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          ₹{row.original.savingProfit.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'savingPercentage',
      header: 'Saving %',
      cell: ({ row }) => (
        <span className={`font-medium ${
          parseFloat(row.original.savingPercentage) > 0 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {row.original.savingPercentage}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const lower = status.toLowerCase();
        
        if (lower === 'approved') {
          return <Badge variant="light" color="success" size="sm">{status}</Badge>;
        }
        if (lower === 'rejected') {
          return <Badge variant="light" color="error" size="sm">{status}</Badge>;
        }
        if (lower === 'pending') {
          return <Badge variant="light" color="warning" size="sm">{status}</Badge>;
        }
        return <Badge variant="light" color="primary" size="sm">{status}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Item Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Select Item for Review
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {arcRfqItems.map((item, index) => (
            <button
              key={item.id || index}
              onClick={() => handleItemSelect(item)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedItem?.id === item.id
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {item.rfqItem?.item?.description || `Item ${index + 1}`}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {item.rfqItem?.item?.itemCode || 'N/A'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {item.vendors?.length || 0} vendors
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      {selectedItem && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Price Comparison - {selectedItem.rfqItem?.item?.description || 'Selected Item'}
            </h3>
          </div>
          
          <div className="p-6">
            <DataTable
              columns={columns}
              data={tableData}
              loading={loading}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
              pageSize={10}
              currentPage={1}
            />
          </div>
        </div>
      )}

      {/* No Items Message */}
      {arcRfqItems.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No items available for comparison</p>
        </div>
      )}
    </div>
  );
};

export default ComparativeReview;
