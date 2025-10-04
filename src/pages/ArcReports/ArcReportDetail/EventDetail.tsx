import React from 'react';
import Badge from '../../../components/ui/badge/Badge';
import type { ArcReportData } from '../../../Typings/ArcReportTypes';

interface EventDetailProps {
  data: ArcReportData | undefined;
}

const EventDetail: React.FC<EventDetailProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
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
    if (lower === 'in_approval') {
      return <Badge variant="light" color="primary" size="sm">{status}</Badge>;
    }
    return <Badge variant="light" color="primary" size="sm">{status}</Badge>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Summary Info</h3>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          ARC Number: {data.arcNumber}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-24">RFQ Title:</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {data.rfqEvent?.title || 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-24">Department:</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {data.rfqEvent?.department?.name || 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-24">End Time:</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {data.rfqEvent?.technicalSpec?.endDate || 'N/A'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-24">Payment Terms:</span>
            <span className="text-sm text-gray-900 dark:text-white">
              {data.rfqEvent?.technicalSpec?.paymentTerms || 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-24">Vendor Responded:</span>
            <span className="text-sm text-gray-900 dark:text-white">0</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-24">Status:</span>
            {getStatusBadge(data.status)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
