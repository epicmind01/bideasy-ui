import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '../../../components/ui/button/Button';
import PageHeader from '../../../components/ui/page-header/PageHeader';
import { Modal } from '../../../components/ui/modal/Modal';
import { 
  useGetArcReportByIdApi, 
  useApproveOrRejectArcReportApi 
} from '../../../hooks/API/ArcReportApi';
import EventDetail from './EventDetail';
import ComparativeReview from './ComparativeReview';
import ApproveDetail from './ApproveDetail';
import PriceContractView from './PriceContractView';

const ArcReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [currentTab, setCurrentTab] = useState(0);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [selectedRfqItemId, setSelectedRfqItemId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isFetching } = useGetArcReportByIdApi(id!);
  const { mutate: approveOrRejectArcReport } = useApproveOrRejectArcReportApi();
  
  const arcReport = data?.arcReport;
  // Note: nextARCReport is not available in the current API response
  const nextARCReport = null;

  const handleNextArc = () => {
    // Note: nextARCReport functionality is not available in current API
    toast.error('No more ARC reports available');
  };

  const handleApprove = () => {
    if (!selectedRfqItemId) {  
      toast.error('Please select an item');
      return;
    }

    if (!arcReport?.id) {
      toast.error('ARC Report ID is required');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      arcReportId: arcReport.id,
      approvedById: 'current-user-id', // This should come from auth context
      remarks: approvalRemarks,
      status: approvalStatus
    };

    approveOrRejectArcReport(payload, {
      onSuccess: () => {
        toast.success('ARC Report status updated successfully.');
        setApprovalModalOpen(false);
        setApprovalRemarks('');
        setIsSubmitting(false);
        // Refresh the data or navigate
        window.location.reload();
      },
      onError: (error) => {
        console.error('Error updating ARC Report:', error);
        toast.error('Failed to update ARC Report status');
        setIsSubmitting(false);
      }
    });
  };

  const handleOpenApprovalModal = (status: 'APPROVED' | 'REJECTED') => {
    setApprovalStatus(status);
    setApprovalModalOpen(true);
  };

  const tabs = [
    { name: 'ARC Reports', component: 'arc' },
    { name: 'Contract', component: 'contract' }
  ];

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!arcReport) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h3 className="font-medium">ARC Report Not Found</h3>
          <p className="text-sm mt-1">The requested ARC report could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader 
        title="ARC Report Details" 
        subtitle={`ARC Number: ${arcReport.arcNumber}`}
        showBackButton={true}
      >
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleNextArc}
            disabled={!nextARCReport}
          >
            Next ARC →
          </Button>
        </div>
      </PageHeader>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          {tabs.map((tab, index) => (
            <button
              key={tab.name}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                currentTab === index
                  ? 'bg-brand-100 text-brand-700 hover:bg-brand-200 border-brand-200 dark:bg-brand-600/30 dark:border-brand-600/50 dark:text-white dark:hover:bg-brand-700/40'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700/80'
              }`}
              onClick={() => setCurrentTab(index)}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {currentTab === 0 && (
          <>
            <EventDetail data={arcReport} />
            
            {arcReport.rfqItems && id && (
              <ComparativeReview 
                arcRfqItems={arcReport.rfqItems} 
                rfqEventId={id}  
                setRfqItemId={setSelectedRfqItemId} 
              />
            )}
            
            <ApproveDetail data={arcReport} />

            {/* Approval Actions */}
            {arcReport.status === 'PENDING' && arcReport.approvals && 
             arcReport.approvals.length > 0 && 
             arcReport.approvals.some((item: any) => 
               item.status === 'PENDING' && item.approvedById === 'current-user-id'
             ) && (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleOpenApprovalModal('REJECTED')}
                  className="bg-red-600 text-white hover:bg-red-700 border-red-600"
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleOpenApprovalModal('APPROVED')}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Approve
                </Button>
              </div>
            )}
          </>
        )}

        {currentTab === 1 && (
          <PriceContractView />
        )}
      </div>

      {/* Approval Modal */}
      <Modal
        isOpen={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false);
          setApprovalRemarks('');
        }}
        title={`${approvalStatus === 'APPROVED' ? 'Approve' : 'Reject'} ARC Report`}
        confirmText={isSubmitting ? 'Processing...' : approvalStatus === 'APPROVED' ? 'Approve' : 'Reject'}
        cancelText="Cancel"
        onConfirm={handleApprove}
        onCancel={() => {
          setApprovalModalOpen(false);
          setApprovalRemarks('');
        }}
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to {approvalStatus.toLowerCase()} this ARC Report?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={approvalRemarks}
              onChange={(e) => setApprovalRemarks(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              rows={3}
              placeholder="Enter remarks..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ArcReportDetail;
