import { MdOutlineFileDownload } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGetGrnByIdApi, useUpdateGrnApi, type GoodReceiptNote } from "../../hooks/API/GRNApi";
import toast from "react-hot-toast";
import { formatDate, hasPermission } from "../../utils/Helpers";
import { Paperclip, Download } from "lucide-react";
import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../../components/ui/data-table/DataTable';
import PageHeader from '../../components/ui/page-header/PageHeader';
import Badge from '../../components/ui/badge/Badge';
import Button from '../../components/ui/button/Button';
import CustomInput from "../../components/form/CustomInput";
import CustomDatePicker from "../../components/ui/date-picker/CustomDatePicker";
import FlexLoader from "../../components/ui/loader/FlexLoader";

// Define GRN Item type locally
interface GRNItem {
  itemId: string;
  quantity: number;
  totalQuantity: number;
  expiryDate?: string;
  rejectedQuantity?: number;
  reasonForRejection?: string;
}

const UpdateGRN = () => {
  const { id: grnId } = useParams<{ id: string }>();
  const [grnData, setGrnData] = useState<GoodReceiptNote | null>(null);
  const [remarks, setRemarks] = useState("");
  const [_grnStatus, _setGrnStatus] = useState<"PENDING" | "COMPLETED" | "REJECTED">("PENDING");
  const [grnAttachments, setGrnAttachments] = useState<File[]>([]);
  const [receivedByDate, setReceivedByDate] = useState<Date | null>(null);
  const [securityNumber, setSecurityNumber] = useState<string>("");
  const [grnItems, setGrnItems] = useState<GRNItem[]>([]);

  const { data: fetchedGrnData, isLoading, error } = useGetGrnByIdApi(grnId || '');
  const updateGrnApi = useUpdateGrnApi();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      toast.error("Failed to load GRN details.");
    }
    if (fetchedGrnData) {
      setGrnData(fetchedGrnData);
      setRemarks(fetchedGrnData.remarks || "");
      _setGrnStatus(fetchedGrnData.status);
      setReceivedByDate(fetchedGrnData.receivedByDate ? new Date(fetchedGrnData.receivedByDate) : null);
      setSecurityNumber(fetchedGrnData.securityNumber || "");
      setGrnItems(
        fetchedGrnData.GoodReceiptNoteItem.map((item) => ({
          itemId: item.itemId,
          quantity: item?.quantity || item.totalQuantity,
          totalQuantity: item.totalQuantity,
          expiryDate: item.expiryDate ? formatDate(item.expiryDate) : undefined,
          rejectedQuantity: item.quantityRejected || 0,
          reasonForRejection: item.reasonForRejection || '',
        }))
      );
    }
  }, [fetchedGrnData, error]);


  const handleGrnAttachmentChange = (files: FileList | null) => {
    if (files) {
      const validFiles = Array.from(files).filter((file) => {
        const isValidType = ['application/vnd.ms-excel', 'image/jpeg', 'image/png', 'application/pdf'].includes(file.type);
        const isValidSize = file.size <= 25 * 1024 * 1024; // 25 MB
        if (!isValidType) toast.error(`Invalid file type for ${file.name}`);
        if (!isValidSize) toast.error(`File ${file.name} exceeds 25 MB`);
        return isValidType && isValidSize;
      });
      setGrnAttachments(validFiles);
    }
  };

  const handleItemChange = (itemId: string, field: "quantity" | "totalQuantity" | "expiryDate" | "rejectedQuantity" | "reasonForRejection", value: number | string) => {
  
  if(field === "quantity"){
    // check if quantity is less than totalQuantity
    const item = grnItems.find((item) => item.itemId === itemId);
    if (item && Number(value) > item.totalQuantity) {
      toast.error("Quantity cannot be greater than total quantity.");
      return;
    }
  }

  if(field === "rejectedQuantity"){
    // check if rejected quantity + accepted quantity is less than or equal to totalQuantity
    const item = grnItems.find((item) => item.itemId === itemId);
    if (item && Number(value) > item.quantity) {
      toast.error("Rejected quantity cannot be greater than received quantity.");
      return;
    }
  }
    
    setGrnItems((prevItems) =>
      prevItems.map((item) =>
        item.itemId === itemId
          ? {
              ...item,
              [field]: field === "quantity" || field === "totalQuantity" || field === "rejectedQuantity" ? Number(value) : value,
            }
          : item
      )
    );
  };

  const handleUpdateGrn = async () => {
    if (!grnId || !grnData) {
      toast.error("GRN ID is missing.");
      return;
    }
   
  
    const allItemsReceived = grnItems.every((item) => (item.quantity + (item.rejectedQuantity || 0)) === item.totalQuantity);
    if (allItemsReceived && !window.confirm("All items are fully processed (accepted + rejected). This will mark the GRN and ASN as COMPLETED. Proceed?")) {
      return;
    }
    if (!receivedByDate) {
      toast.error("Received By Date is missing.");
      return;
    }
    if (!securityNumber) {
      toast.error("Security Number is missing.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("grnId", grnId);
      formData.append("remarks", remarks);
      formData.append("status", allItemsReceived ? "COMPLETED" : 'REJECTED');
      formData.append("items", JSON.stringify(grnItems));

      formData.append("receivedByDate", new Date(receivedByDate).toISOString());
      formData.append("securityNumber", securityNumber);
  
      grnAttachments.forEach((file) => {
        formData.append("asnAttachments", file, file.name);
      });
      setLoading(true);
  
      await updateGrnApi.mutateAsync(formData);
      toast.success(
        allItemsReceived
          ? "Goods Receipt Note and ASN marked as COMPLETED."
          : "Goods Receipt Note updated successfully."
      );
      setLoading(false);  
      setGrnAttachments([]);
      navigate(`/grn-list`);
    } catch (err) {
      console.error(err);
      toast.error("Oops! Something went wrong. Please try again later.");
      setLoading(false);
    }
  };

  const handleDownloadAttachment = (attachment: any) => {
    // open a new tab and download the attachment
    window.open(attachment.fileUrl, '_blank');
  }
  
  const handleCancel = () => {
    if (grnData) {
      setRemarks(grnData.remarks || "");
      _setGrnStatus(grnData.status);
      setGrnItems(
        grnData.GoodReceiptNoteItem.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          totalQuantity: item.totalQuantity,
        }))
      );
      setGrnAttachments([]);
    }
  };

  if (isLoading) {
    return <FlexLoader />
  }

  if (!grnData) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500 dark:text-gray-400">GRN not found.</div>
      </div>
    );
  }

  // Define columns for DataTable
  const columns: ColumnDef<GRNItem>[] = [
    {
      accessorKey: 'itemId',
      header: 'Item No',
      cell: ({ row }) => {
        const item = grnData.GoodReceiptNoteItem.find((i) => i.itemId === row.original.itemId);
        return <div className="font-medium">{item?.item?.itemCode || ""}</div>;
      },
    },
    {
      accessorKey: 'itemId',
      header: 'Material Description',
      cell: ({ row }) => {
        const item = grnData.GoodReceiptNoteItem.find((i) => i.itemId === row.original.itemId);
        return <div className="text-gray-700 dark:text-gray-300">{item?.item?.MasterGeneric?.name || ""}</div>;
      },
    },
    {
      accessorKey: 'totalQuantity',
      header: 'Total Quantity',
      cell: ({ getValue }) => (
        <div className="text-gray-700 dark:text-gray-300">{getValue() as number}</div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Received Quantity',
      cell: ({ row }) => (
        <input
          type="number"
          value={row.original.quantity}
          onChange={(e) => handleItemChange(row.original.itemId, "quantity", e.target.value)}
          disabled={grnData.status !== "PENDING"}
          className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
      ),
    },
    {
      accessorKey: 'rejectedQuantity',
      header: 'Rejected Quantity',
      cell: ({ row }) => (
        <input
          type="number"
          value={row.original.rejectedQuantity || 0}
          onChange={(e) => handleItemChange(row.original.itemId, "rejectedQuantity", e.target.value)}
          disabled={grnData.status !== "PENDING"}
          className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
      ),
    },
    {
      accessorKey: 'reasonForRejection',
      header: 'Rejection Remark',
      cell: ({ row }) => (
        <input
          type="text"
          value={row.original.reasonForRejection || ''}
          onChange={(e) => handleItemChange(row.original.itemId, "reasonForRejection", e.target.value)}
          disabled={grnData.status !== "PENDING" || (row.original.rejectedQuantity || 0) <= 0}
          placeholder="Reason for rejection"
          className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        />
      ),
    },
    {
      accessorKey: 'expiryDate',
      header: 'Expiry Date',
      cell: ({ getValue }) => (
        <div className="text-gray-700 dark:text-gray-300">
          {getValue() ? formatDate(getValue() as string) : ""}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Update Goods Receipt Note"
        subtitle="Update GRN details and manage item quantities"
        showBackButton={true}
      >
        {hasPermission("GRN View export") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}}
            className="flex items-center gap-2"
          >
            <MdOutlineFileDownload size={16} />
            Export
          </Button>
        )}
      </PageHeader>

      <div className="space-y-6">

        {/* GRN Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">GRN Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">GRN Number</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{grnData.grnNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ASN Number</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{grnData.asn?.asnNumber ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Shipment Reference</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{grnData.asn?.shipmentReference ?? 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ASN Date</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {grnData.asn?.createdAt ? formatDate(grnData.asn?.createdAt) : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Vendor</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{grnData.vendor.tempName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">PO Reference No</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {grnData.asn?.purchaseOrder?.purchaseOrderNumber || (grnData.Invoice && grnData.Invoice.length > 0) ? grnData.Invoice[0]?.po?.purchaseOrderNumber : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* GRN Items Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">GRN Items</h3>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <DataTable
              columns={columns}
              data={grnItems}
              totalItems={grnItems.length}
              isLoading={false}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
              rowSelection={{}}
              onRowSelectionChange={() => {}}
              pageSize={10}
              currentPage={1}
            />
          </div>
        </div>

        {/* GRN Attachments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">GRN Attachments</h3>
          <div className="space-y-3">
            {grnData.GRNAttachment.length > 0 ? (
              grnData.GRNAttachment.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{attachment.fileName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{attachment.fileType}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadAttachment(attachment)}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No GRN attachments available.
              </div>
            )}
          </div>
        </div>

        {/* GRN Details Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">GRN Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomDatePicker
              label="Received By Date"
              value={receivedByDate ? new Date(receivedByDate) : null}
              onChange={(date) => setReceivedByDate(date)}
              placeholder="Enter the received by date"
              disabled={grnData.status !== "PENDING"}
              dateFormat="yyyy-MM-dd"
            />
            <CustomInput
              label="Security Number"
              value={securityNumber || ''}
              setValue={setSecurityNumber}
              placeholder="Enter the security number"
              disabled={grnData.status !== "PENDING"}
              additionalClasses="w-full"
            />
          </div>
          <div className="mt-6 space-y-4">
            <CustomInput
              label="Remarks"
              value={remarks}
              setValue={setRemarks}
              placeholder="Enter any remarks for the GRN"
              disabled={grnData.status !== "PENDING"}
              additionalClasses="w-full"
            />
            <CustomInput
              value={grnAttachments}
              setValue={handleGrnAttachmentChange}
              type="file"
              additionalClasses="w-full"
              label="Choose File (Maximum upload file size 25 MB, allowed files XLS,JPG,PNG,PDF)"
              multiInputs
              required
            />
          </div>
        </div>

        {/* Status Tracking */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Tracking</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">GRN Status</span>
            <Badge
              variant="light"
              color={
                grnData.status === "COMPLETED" ? "success" :
                grnData.status === "REJECTED" ? "error" : "warning"
              }
              size="sm"
            >
              {grnData.status}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        {grnData.status === "PENDING" && (
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateGrn}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                'Submit GRN'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateGRN;
