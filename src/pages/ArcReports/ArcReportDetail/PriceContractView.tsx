import React, { useState } from 'react';
import { 
  Calendar,
  Package,
  Building2,
  DollarSign,
  FileText,
  Download,
  Edit,
  RotateCcw,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Paperclip,
  Truck,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import Button from '../../../components/ui/button/Button';

interface ContractData {
  id: string;
  itemName: string;
  sku: string;
  category: string;
  status: 'Active' | 'Expired' | 'Pending Approval' | 'Expiring Soon';
  supplierName: string;
  supplierLogo?: string;
  contractStartDate: string;
  contractEndDate: string;
  unitPrice: number;
  currency: string;
  uom: string;
  totalValue: number;
  deliveryTerms: string;
  paymentTerms: string;
  penalties: string;
  notes: string;
  attachments: Array<{ name: string; type: string; size: string; }>;
  history: Array<{ date: string; action: string; user: string; }>;
  vendorResponse?: Array<{
    id: string;
    status: string;
    remarks: string;
    respondedAt: string;
    vendorName: string;
    createdAt: Date;
  }>;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending Approval':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Expiring Soon':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-4 h-4" />;
      case 'Expired':
        return <XCircle className="w-4 h-4" />;
      case 'Pending Approval':
        return <Clock className="w-4 h-4" />;
      case 'Expiring Soon':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      {status}
    </span>
  );
};

const PriceContractView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('details');
  const [_isSubmittingResponse, _setIsSubmittingResponse] = useState(false);

  // Mock contract data - in real app this would come from API
  const contractData: ContractData = {
    id: '1',
    itemName: 'Sample Product',
    sku: 'SKU-001',
    category: 'Electronics',
    status: 'Active',
    supplierName: 'Sample Supplier',
    contractStartDate: '2024-01-01',
    contractEndDate: '2024-12-31',
    unitPrice: 1000,
    currency: 'INR',
    uom: 'Pieces',
    totalValue: 100000,
    deliveryTerms: 'FOB',
    paymentTerms: 'Net 30',
    penalties: '5% per month',
    notes: 'Standard contract terms apply',
    attachments: [
      { name: 'contract.pdf', type: 'PDF', size: '2.5 MB' },
      { name: 'terms.pdf', type: 'PDF', size: '1.2 MB' }
    ],
    history: [
      { date: '2024-01-01', action: 'Contract Created', user: 'John Doe' },
      { date: '2024-01-15', action: 'Contract Approved', user: 'Jane Smith' }
    ],
    vendorResponse: [
      {
        id: '1',
        status: 'Accepted',
        remarks: 'Terms are acceptable',
        respondedAt: '2024-01-10',
        vendorName: 'Sample Supplier',
        createdAt: new Date('2024-01-10')
      }
    ]
  };

  const tabs = [
    { id: 'details', name: 'Contract Details', icon: FileText },
    { id: 'attachments', name: 'Attachments', icon: Paperclip },
    { id: 'history', name: 'History', icon: Clock },
    { id: 'vendorResponse', name: 'Vendor Response', icon: MessageSquare }
  ];

  const handleEdit = () => {
    console.log('Edit contract');
  };

  const handleExport = () => {
    console.log('Export contract');
  };

  const handleRenew = () => {
    console.log('Renew contract');
  };

  const _handleViewAudit = () => {
    console.log('View audit trail');
  };

  const handleDownloadAttachment = (attachment: { name: string; type: string; size: string; }) => {
    console.log('Download attachment:', attachment);
  };

  return (
    <div className="space-y-6">
      {/* Contract Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {contractData.itemName}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={contractData.status} />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Created on {new Date(contractData.contractStartDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRenew}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Renew
            </Button>
          </div>
        </div>

        {/* Contract Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">SKU</p>
                  <p className="font-medium text-gray-900 dark:text-white">{contractData.sku}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unit Price</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    ₹{contractData.unitPrice.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Supplier</p>
                  <p className="font-medium text-gray-900 dark:text-white">{contractData.supplierName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Terms</p>
                  <p className="font-medium text-gray-900 dark:text-white">{contractData.deliveryTerms}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Duration */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contract Duration</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(contractData.contractStartDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">End Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(contractData.contractEndDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Contract Notes</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {contractData.notes}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Payment Terms</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{contractData.paymentTerms}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Penalties</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{contractData.penalties}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Contract Documents</h4>
              <div className="space-y-3">
                {contractData.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                        <Paperclip className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{attachment.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{attachment.type} • {attachment.size}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadAttachment(attachment)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Contract Timeline</h4>
              <div className="space-y-4">
                {contractData.history.map((entry, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-brand-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.action}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(entry.date).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">by {entry.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vendorResponse' && contractData.vendorResponse && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Vendor Response</h4>
              <div className="space-y-4">
                {contractData.vendorResponse.map((response) => (
                  <div key={response.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {response.vendorName}
                      </p>
                      <StatusBadge status={response.status} />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {response.remarks}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Responded on {new Date(response.respondedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceContractView;
