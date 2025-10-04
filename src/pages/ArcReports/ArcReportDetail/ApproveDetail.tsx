import React from 'react';
import Badge from '../../../components/ui/badge/Badge';
import type { ArcReportData } from '../../../Typings/ArcReportTypes';

interface ApproveDetailProps {
  data: ArcReportData | undefined;
}

const ApproveDetail: React.FC<ApproveDetailProps> = ({ data }) => {
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
    return <Badge variant="light" color="primary" size="sm">{status}</Badge>;
  };

  // Check if there are priority changes
  const hasPriorityChanges = data.rfqItems?.some((item) => 
    item.vendors?.some((vendor) => vendor.preferedVendorRank !== vendor.rank)
  );

  return (
    <div className="space-y-6">
      {/* Priority Changes Alert */}
      {hasPriorityChanges && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            Manual Priority Changes Detected
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            Manual priority changes have been made to vendor rankings. Please review the changes carefully before proceeding with approval.
          </p>
        </div>
      )}

      {/* Approvals Table */}
      {data.approvals && data.approvals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Approval Details</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.approvals.map((approval, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {approval.approvedBy?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {approval.approvedBy?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(approval.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Approvals Message */}
      {(!data.approvals || data.approvals.length === 0) && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No approval details available</p>
        </div>
      )}
    </div>
  );
};

export default ApproveDetail;
