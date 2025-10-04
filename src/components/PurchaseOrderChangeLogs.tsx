import React, { useState } from 'react';
import { useGetPurchaseOrderChangeLogsApi } from '../hooks/API/PurchaseOrderApi';
import { format } from 'date-fns';

interface ChangeLog {
  id: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  changeType: string;
  itemId?: string;
  itemCode?: string;
  remarks?: string;
  changedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface PurchaseOrderChangeLogsProps {
  purchaseOrderId: string;
}

const PurchaseOrderChangeLogs: React.FC<PurchaseOrderChangeLogsProps> = ({ purchaseOrderId }) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data: changeLogsData, isLoading, error } = useGetPurchaseOrderChangeLogsApi(purchaseOrderId, page, limit);

  const changeLogs = changeLogsData?.changeLogs || [];
  const pagination = changeLogsData?.pagination;

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'field_update':
        return 'bg-blue-100 text-blue-800';
      case 'item_added':
        return 'bg-green-100 text-green-800';
      case 'item_removed':
        return 'bg-red-100 text-red-800';
      case 'item_updated':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case 'field_update':
        return 'Field Updated';
      case 'item_added':
        return 'Item Added';
      case 'item_removed':
        return 'Item Removed';
      case 'item_updated':
        return 'Item Updated';
      default:
        return changeType;
    }
  };

  const getFieldDisplayName = (fieldName: string) => {
    switch (fieldName) {
      case 'title':
        return 'Title';
      case 'organisation':
        return 'Organisation';
      case 'companyCode':
        return 'Company Code';
      case 'vendor':
        return 'Vendor';
      case 'status':
        return 'Status';
      case 'item_quantity':
        return 'Item Quantity';
      case 'item_price':
        return 'Item Price';
      default:
        return fieldName;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading change logs</p>
      </div>
    );
  }

  if (changeLogs.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-3">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Change Logs Found</h3>
          <p className="text-gray-500">No change logs found for this purchase order.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Change History</h3>
        <p className="text-sm text-gray-500">Track all changes made to this purchase order</p>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {changeLogs.map((log: ChangeLog) => (
          <div key={log.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
            <div className="flex-grow">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChangeTypeColor(log.changeType)}`}>
                  {getChangeTypeLabel(log.changeType)}
                </span>
                {log.itemCode && (
                  <span className="text-sm text-gray-500">Item: {log.itemCode}</span>
                )}
              </div>

              <div className="mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {getFieldDisplayName(log.fieldName)}:
                </span>
                {log.oldValue && (
                  <span className="text-sm text-red-600 ml-1 line-through">
                    {log.oldValue}
                  </span>
                )}
                {log.newValue && (
                  <span className="text-sm text-green-600 ml-1">
                    → {log.newValue}
                  </span>
                )}
              </div>

              {log.remarks && (
                <p className="text-sm text-gray-600 mb-2">{log.remarks}</p>
              )}
            </div>

            <div className="mt-auto pt-2 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
              <span>By: {log.changedBy.name}</span>
              <span>•</span>
              <span>{format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {pagination.currentPage} of {pagination.totalPages} 
              ({pagination.totalCount} total changes)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderChangeLogs;
