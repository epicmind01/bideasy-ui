import { useParams, useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/Helpers";
import { ReactTable } from "../../components/ui/table/ReactTable";
import { useGetGrnByIdApi } from "../../hooks/API/GRNApi";
import FlexLoader from "../../components/ui/loader/FlexLoader";
import Status from "../../components/ui/status/Status";
import { FaArrowLeft } from 'react-icons/fa';

const GRNView = () => {
  const { grnId } = useParams<{ grnId: string }>();
  const navigate = useNavigate();
  const { data: grnData, isLoading, error } = useGetGrnByIdApi(grnId || '');

  if (isLoading) return <FlexLoader/>;
  if (error || !grnData) return <div className="p-6 text-center">GRN not found</div>;

  const itemColumns = [
    { name: "Item No", selector: (row: any) => row.item.itemCode },
    { name: "Material Description", selector: (row: any) => row.item.MasterGeneric?.name || "-" },
    { name: "Quantity", selector: (row: any) => row.quantity },
    { name: "Total Qty", selector: (row: any) => row.totalQuantity },
    { name: "Expiry Date", selector: (row: any) => row.expiryDate ? formatDate(row.expiryDate) : "-" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GRN Details</h1>
              <nav className="flex space-x-2 text-sm text-gray-500 mt-2">
                <a href="/" className="hover:text-blue-600">Dashboard</a>
                <span>/</span>
                <a href="/grn-list" className="hover:text-blue-600">GRN List</a>
                <span>/</span>
                <span className="text-gray-900">{grnData.grnNumber}</span>
              </nav>
            </div>
            <button
              onClick={() => navigate('/grn-list')}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <FaArrowLeft className="mr-2" />
              Back to List
            </button>
          </div>
        </div>

        {/* GRN Header Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">GRN-{grnData.grnNumber}</h2>
              <p className="text-lg text-gray-600">From ASN-{grnData.asn?.asnNumber ?? 'N/A'}</p>
            </div>
            <div className="text-right">
              <Status status={grnData.status} />
              <p className="text-sm text-gray-500 mt-1">Created: {formatDate(grnData.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Key Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Vendor</h3>
            <p className="text-lg font-semibold text-gray-900">{grnData.vendor.tempName}</p>
            <p className="text-sm text-gray-600">{grnData.vendor.email || ''}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">PO Reference</h3>
            <p className="text-lg font-semibold text-gray-900">{grnData.asn?.purchaseOrder?.purchaseOrderNumber || grnData.Invoice?.length > 0 ? grnData.Invoice[0]?.po?.purchaseOrderNumber : 'N/A'}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Shipment Reference</h3>
            <p className="text-lg font-semibold text-gray-900">{grnData.asn?.shipmentReference || 'N/A'}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Expected Delivery Date</h3>
            <p className="text-lg font-semibold text-gray-900">
              {grnData.asn?.expectedDeliveryDate ? formatDate(grnData.asn?.expectedDeliveryDate) : 'Not specified'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">ASN Date</h3>
            <p className="text-lg font-semibold text-gray-900">{formatDate(grnData.asn?.createdAt ?? 'N/A')}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Remarks</h3>
            <p className="text-lg font-semibold text-gray-900">{grnData.remarks || 'No remarks'}</p>
          </div>
        </div>

        {/* GRN Items Table */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">GRN Items ({grnData.GoodReceiptNoteItem?.length || 0})</h3>
          </div>
          <div className="p-6">
            <ReactTable
              data={grnData.GoodReceiptNoteItem || []}
              columns={itemColumns}
              loading={false}
              rowsPerPageText={10}
              isServerPropsDisabled={true}
            />
          </div>
        </div>

        {/* GRN Attachments */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">GRN Attachments</h3>
          </div>
          <div className="p-6">
            {grnData.GRNAttachment?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grnData.GRNAttachment.map((attachment, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Attachment {index + 1}</p>
                        <p className="text-sm text-gray-600">{attachment.fileName || "Document"}</p>
                      </div>
                      <a 
                        href={attachment.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📎</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Attachments</h3>
                <p className="text-gray-500">No attachments have been uploaded for this GRN.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GRNView;
