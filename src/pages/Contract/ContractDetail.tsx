import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../services/axiosClient';
import FlexLoader from '../../components/ui/loader/FlexLoader';
import { ReactTable } from '../../components/ui/table/ReactTable';
import TitleText from '../../components/ui/title-text/TitleText';
import dayjs from 'dayjs';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MapPin,
  Paperclip,
  Download,
  MessageSquare,
  Edit,
  RotateCcw,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Building2,
  FileText
} from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { CreditCard } from 'lucide-react';
import { BiRupee } from 'react-icons/bi';
import PreferredVendorForContractModal from '../../components/modals/contract/PreferredVendorForContractModal';
import { Send } from 'lucide-react';
import { useUpdateContractStatusApi } from '../../hooks/API/ContractApi';
import toast from 'react-hot-toast';
import CustomDatePicker from '../../components/ui/date-picker/CustomDatePicker';
import { FaCalendar } from 'react-icons/fa';

interface ContractItem {
  id: string;
  itemId: string;
  quantity: number;
  price: number;
  status: string;
  item?: {
    itemCode: string;
    description: string;
    unitOfMeasure: string;
    MasterBrand?: {
      name: string;
      id: string;
    };
  };
}

interface Attachment {
  name: string;
  type: string;
  size: string;
  url: string;
}

interface HistoryEntry {
  action: string;
  date: string;
  user: string;
}


interface PreferredVendorForContract {
  id: string;
  plantCode: string;
  plant: {
    id: string;
    name: string;
    code: string;
  };
  distributorName?: string;
  distributorId?: string;
  distributor?: {
    id: string;
    tempName: string;
    email: string;
    vendorCode: string;
    tempCompanyName: string;
    isTemporary: boolean;
    isRegistered: boolean;
    deletedAt?: string;
    vendorDetailRequest?: {
      status: string;
    };
  };
  status: string;
  updatedByVendor: boolean;
  createdAt: string;
  updatedAt: string;
}


const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EXPIRED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EXPIRING_SOON':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4" />;
      case 'EXPIRED':
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'EXPIRING_SOON':
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

const ContractDetail = () => {
  const { id: contractId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('preferredVendors');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isPreferredVendorModalOpen, setIsPreferredVendorModalOpen] = useState(false);

  const updateContractStatusApi = useUpdateContractStatusApi();
  // Fetch contract details
  const { data: contractData, isLoading, refetch } = useQuery({
    queryKey: ['contract_detail', contractId],
    queryFn: async () => {
      const response = await axiosClient.get(
        `/contracts/${contractId}`
      );
      return response.data.data;
    },
    enabled: !!contractId,
  });
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM DD, YYYY');
  };

  const getStatusBadge = (vendor: any) => {
    const status = vendor?.distributor?.isTemporary || vendor?.distributor?.deletedAt !== null
      ? 'TEMPORARY'
      : vendor.distributor?.deletedAt !== null ? 'DELETED' : vendor.distributor?.status || 'PENDING';
    switch (status) {
      case "APPROVED":
        return (
          <span className="text-textColor-success bg-textColor-success-light px-2 py-1 rounded-md text-sm">
            Approved
          </span>
        );
      case "PENDING":
        return (
          <span className="text-textColor-pending bg-textColor-pending-light px-2 py-1 rounded-md text-sm">
            Pending
          </span>
        );
      case "REJECTED":
        return (
          <span className="text-textColor-error bg-textColor-error-light px-2 py-1 rounded-md text-sm">
            Rejected
          </span>
        );
      case "TEMPORARY":
        return (
          <span className="text-black bg-gray-300 px-2 py-1 rounded-md text-sm">
            Temporary
          </span>
        );
      case "INPROGRESS":
        return (
          <span className="text-customBlue-600 bg-customBlue-200 px-2 py-1 rounded-md text-sm">
            In Progress
          </span>
        );
      case "DELETED":
        return (
          <span className="text-red-600 bg-red-200 px-2 py-1 rounded-md text-sm">
            Deleted
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  // Calculate days remaining in contract
  const calculateDaysRemaining = (startDate: string, endDate: string) => {

    const end = new Date(endDate).getTime();
    const today = new Date(startDate).getTime();
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = contractData?.createdAt
    ? calculateDaysRemaining(contractData.startDate || contractData.createdAt, contractData.endDate || contractData.createdAt)
    : 0;

  // Action handlers
  const handleEdit = () => {
    console.log('Edit contract');
  };

  const handleExport = () => {
    console.log('Export contract');
  };

  const handleRenew = () => {
    console.log('Renew contract');
  };

  const handleViewAudit = () => {
    console.log('View audit trail');
  };

  const handleBack = () => {
    navigate(-1);
  };


  const handleManagePreferredVendors = () => {
    setIsPreferredVendorModalOpen(true);
  };

  const handlePreferredVendorModalClose = () => {
    setIsPreferredVendorModalOpen(false);
  };

  const handlePreferredVendorSuccess = () => {
    // Refetch contract data to get updated preferred vendors
    // The query will automatically refetch due to the key dependency
  };

  const handleSendToVendor = async () => {
    if (!startDate || !endDate) {
      toast.error('Start Date and End Date are required');
      return;
    }
    if (startDate > endDate) {
      toast.error('Start Date must be before End Date');
      return;
    }
    // setIsSubmittingResponse(true);
    try {
      if (!contractId) {
        toast.error('Contract ID is required');
        return;
      }
      const status = 'PENDING';
      // if(contractData?.status === 'APPROVED'){
      //   status = 'APPROVED';
      // }else if(contractData?.status === 'REJECTED'){
      //   status = 'REJECTED';
      // }
      const response = await updateContractStatusApi.mutateAsync({ contractId, status, startDate, endDate });
      toast.success('Contract sent to vendor successfully');
      refetch();
      console.log(response);

    } catch (error) {
      console.error('Error sending to vendor:', error);
      toast.error('Failed to send to vendor');
    } finally {
      // setIsSubmittingResponse(false);
    }
    console.log('Vendor sent to vendor');
  };


  // Contract items table columns
  const columns = [
    {
      name: "Item Code",
      selector: (row: ContractItem) => row.item?.itemCode || "N/A",
      sortable: true,
    },
    {
      name: "Generic Name",
      selector: (row: ContractItem) => row.item?.MasterBrand?.name || "N/A",
      sortable: true,
      cell: (row: ContractItem) => (
        <div className="max-w-xs truncate" title={row.item?.MasterBrand?.name}>
          {row.item?.MasterBrand?.name}
        </div>
      ),
    },

    {
      name: "Unit Price",
      selector: (row: ContractItem) => row.price,
      sortable: true,
      cell: (row: ContractItem) => (
        <div className="flex items-center">
          <BiRupee className="w-4 h-4 text-green-600 mr-1" />
          <span>{row.price}</span>
        </div>
      ),
    },
    {
      name: "Status",
      selector: (row: ContractItem) => row.status,
      sortable: true,
      cell: (row: ContractItem) => <StatusBadge status={row.status == 'APPROVED' ? 'ACTIVE' : row.status == 'REJECTED' ? 'EXPIRED' : row.status} />
    }
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <FlexLoader />
      </div>
    );
  }

  if (!contractData) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h3 className="font-medium">Contract Not Found</h3>
          <p className="text-sm mt-1">The requested contract could not be found or you don't have permission to view it.</p>
          <button
            onClick={handleBack}
            className="mt-3 inline-flex items-center text-sm font-medium text-red-700 hover:text-red-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBack}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <TitleText>Contract Details</TitleText>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleRenew}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Renew
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{contractData.contractNumber}</h2>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={contractData.status} />

              <span className="text-sm text-gray-500">
                Created on {new Date(contractData.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div>
            {/* <div className="text-right">
              <span className="text-sm text-gray-600">Total Contract Value</span>
              <div className="text-2xl font-bold text-green-600 flex items-center">
                <BiRupee className="w-4 h-4 text-green-600 mr-1" /> {contractData.price || '0'}
              </div>
            </div> */}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main contract details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">RFQ Reference</p>
                    <p className="font-medium text-gray-900">{contractData.rfq?.eventCode || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ARC Reference</p>
                    <p className="font-medium text-gray-900">{contractData?.arc?.arcNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {
                contractData.startDate && contractData.endDate && (

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-medium text-gray-900">
                          {contractData.createdAt
                            ? formatDate(contractData.startDate)
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="font-medium text-gray-900">
                          {contractData.createdAt ?
                            formatDate(contractData?.endDate)
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Vendor Info */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vendor Name</p>
                      <p className="font-medium text-gray-900">{contractData.arcVendor?.tempCompanyName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact Email</p>
                      <p className="font-medium text-gray-900">{contractData.arcVendor?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vendor Code</p>
                      <p className="font-medium text-gray-900">{contractData?.arcVendor?.vendorCode || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Terms</p>
                      <p className="font-medium text-gray-900">{contractData.rfq?.technicalSpec?.paymentTerms || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contract Items */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Items</h3>

                <ReactTable
                  data={contractData.contractItems || []}
                  columns={columns}
                  isServerPropsDisabled={true}
                />
              </div>

            
            </div>
            
          </div>
          

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contract Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Status</h3>
                <div className="space-y-4">
                  <div className='overflow-hidden'>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Time Remaining</span>
                      <span className="text-sm font-medium text-gray-900">{daysRemaining} days</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${daysRemaining <= 30 ? 'bg-orange-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.max(10, (365 - daysRemaining) / 365 * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {daysRemaining <= 30 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Expiring Soon</span>
                      </div>
                      <p className="text-xs text-orange-700 mt-1">
                        Consider renewing this contract to avoid supply disruption.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Contract Duration</span>
                    <span className="text-sm font-medium text-gray-900">
                      {contractData.startDate && contractData.endDate ? `${dayjs(contractData.endDate).diff(dayjs(contractData.startDate), 'months')} months` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Items</span>
                    <span className="text-sm font-medium text-gray-900">
                      {contractData.contractItems?.length || 0}
                    </span>
                  </div>
                  {/* <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Value</span>
                    <span className="text-sm font-medium text-green-600 flex">
                      <BiRupee className="w-4 h-4 text-green-600 mr-1" /> {contractData.price?.toLocaleString() || '0'}
                    </span>
                  </div> */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <StatusBadge status={contractData.status == 'APPROVED' ? 'ACTIVE' : contractData.status == 'PENDING' ? 'PENDING' : contractData.status == 'REJECTED' ? 'REJECTED' : contractData.status == 'DRAFT' ? 'DRAFT' : 'EXPIRED'} />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleViewAudit}
                    className="w-full flex items-center gap-3 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Audit Trail
                  </button>
                </div>
                {
                  contractData.status === 'DRAFT' && (<>

                    <div className="space-y-3 mt-5">
                      {/* start date */}
                      <div className="flex items-center gap-3">
                        <FaCalendar className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">Start Date</span>
                        <CustomDatePicker value={startDate} onChange={(date: Date | null) => setStartDate(date)} />
                      </div>
                      {/* end date */}
                      <div className="flex items-center gap-3">
                        <FaCalendar className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">End Date</span>
                        <CustomDatePicker value={endDate} onChange={(date: Date | null) => setEndDate(date)} />
                      </div>
                    </div>


                    <div className="space-y-3 mt-5">

                      <button
                        onClick={handleSendToVendor}
                        className="w-full flex items-center gap-3 px-4 py-3 border bg-customBlue-600 text-white border-300 text-gray-700 rounded-lg  transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        Send to Vendor
                      </button>
                    </div>
                  </>

                  )}
              </div>
            </div>
          </div>
        </div>
          {/* Tabs Section */}
          <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="border-b border-gray-200">
                    <nav className="flex">
                      <button
                        onClick={() => setActiveTab('preferredVendors')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'preferredVendors'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        Contract Signed ({contractData.preferredVendorForContract?.length || 0})
                      </button>
                      <button
                        onClick={() => setActiveTab('details')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        Notes & Comments
                      </button>
                      <button
                        onClick={() => setActiveTab('attachments')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'attachments'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        Attachments ({contractData.attachments?.length || 0})
                      </button>
                      <button
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        History & Amendments
                      </button>

                      {contractData.vendorResponse && (
                        <button
                          onClick={() => setActiveTab('vendorResponse')}
                          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'vendorResponse'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          Vendor Response
                        </button>
                      )}
                    </nav>
                  </div>

                  <div className="p-6">
                    {activeTab === 'details' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Contract Notes</h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-700 leading-relaxed">{contractData.notes || 'No notes available'}</p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'attachments' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Contract Documents</h4>
                        <div className="space-y-3">
                          {contractData.attachments && contractData.attachments.length > 0 ? (
                            contractData.attachments.map((attachment: Attachment, index: number) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                    <Paperclip className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                                    <p className="text-xs text-gray-500">{attachment.type} • {attachment.size}</p>
                                  </div>
                                </div>
                                <button
                                  className="text-blue-600 hover:text-blue-700 transition-colors"
                                  onClick={() => console.log('Download attachment:', attachment)}
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-500">No attachments available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'history' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Contract Timeline</h4>
                        <div className="space-y-4">
                          {contractData.history && contractData.history.length > 0 ? (
                            contractData.history.map((entry: HistoryEntry, index: number) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                                    <p className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">by {entry.user}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-500">No history records available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'preferredVendors' && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-900">Preferred Vendors</h4>
                          {
                            contractData.status === 'DRAFT' && (

                              <button
                                onClick={handleManagePreferredVendors}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Manage Preferred Vendors
                              </button>
                            )
                          }
                        </div>

                        <div className="space-y-3">
                          {contractData.preferredVendorForContract && contractData.preferredVendorForContract.length > 0 ? (
                            contractData.preferredVendorForContract.map((preferredVendor: PreferredVendorForContract, index: number) => (
                              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{preferredVendor.plant.name}</p>
                                    <p className="text-xs text-gray-500"> {preferredVendor.plant.code}</p>
                                    {preferredVendor.distributor && (
                                      <p className="text-xs text-gray-600">
                                        {preferredVendor.distributor.tempCompanyName || preferredVendor.distributor.tempName}
                                      </p>
                                    )}
                                    {preferredVendor.distributorName && !preferredVendor.distributor && (
                                      <p className="text-xs text-gray-600"> {preferredVendor.distributorName}</p>
                                    )}
                                    {preferredVendor.distributor && (
                                      <p className="text-xs text-gray-600">
                                        {preferredVendor.distributor.vendorCode}
                                      </p>
                                    )}
                                    {preferredVendor.distributor && (
                                      <p className="text-xs text-gray-600">
                                   {preferredVendor.distributor.email}
                                      </p>
                                    )}
                                    {preferredVendor.distributor && (
                                      <div className="mt-1">
                                        {getStatusBadge(preferredVendor.distributor)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <div className="flex items-center gap-2">
                                    <StatusBadge status={preferredVendor.status} />
                                    {preferredVendor.updatedByVendor && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Updated by Vendor
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {dayjs(preferredVendor.createdAt).format('MMM DD, YYYY')}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center p-8 bg-gray-50 rounded-lg">
                              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-sm text-gray-500 mb-2">No preferred vendors assigned</p>
                              <p className="text-xs text-gray-400">Click "Manage Preferred Vendors" to assign vendors to plants</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === 'vendorResponse' && contractData.vendorResponse && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Vendor Response</h4>
                        <div className="space-y-4">
                          {/* Response Status */}
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <MessageSquare className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Response Status</p>
                              <StatusBadge status={contractData.vendorResponse.status} />
                            </div>
                          </div>

                          {/* Response Date */}
                          {contractData.vendorResponse.respondedAt && (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                              <Calendar className="w-5 h-5 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Responded On</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(contractData.vendorResponse.respondedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Remarks */}
                          {contractData.vendorResponse.remarks && (
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-900 mb-2">Vendor Remarks</p>
                              <p className="text-sm text-gray-700">{contractData.vendorResponse.remarks}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
      </div>

      {/* Preferred Vendor Modal */}
      <PreferredVendorForContractModal
        isOpen={isPreferredVendorModalOpen}
        onClose={handlePreferredVendorModalClose}
        contractId={contractId || ''}
        onSuccess={handlePreferredVendorSuccess}
      />
    </div>
  );
};

export default ContractDetail;
