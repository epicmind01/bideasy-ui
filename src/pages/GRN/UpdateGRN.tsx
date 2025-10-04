import { MdOutlineFileDownload } from "react-icons/md";
import { PrimaryButton } from "../../components/ui/button/PrimaryButton";
import { SecondaryButton } from "../../components/ui/button/SecondaryButton";
import { TitleText } from "../../components/ui/title-text/TitleText";
import { SubTitleText } from "../../components/ui/title-text/SubTitleText";
import { CustomInput } from "../../components/form/CustomInput";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGetGrnByIdApi, useUpdateGrnApi, GoodReceiptNote } from "../../hooks/API/GRNApi";
import toast from "react-hot-toast";
import { formatDate, hasPermission } from "../../utils/Helpers";
import { ReactTable } from "../../components/ui/table/ReactTable";
import { FlexLoader } from "../../components/ui/loader/FlexLoader";
import { Paperclip } from "lucide-react";
import { Download } from "lucide-react";
import { CustomDatePicker } from "../../components/ui/date-picker/CustomDatePicker";

const UpdateGRN = () => {
  const { id: grnId } = useParams<{ id: string }>();
  const [grnData, setGrnData] = useState<GoodReceiptNote | null>(null);
  const [remarks, setRemarks] = useState("");
  const [_grnStatus, _setGrnStatus] = useState<"PENDING" | "COMPLETED" | "REJECTED">("PENDING");
  const [grnAttachments, setGrnAttachments] = useState<File[]>([]);
  const [receivedByDate, setReceivedByDate] = useState<Date | null>(null);
  const [securityNumber, setSecurityNumber] = useState<string>("");
  const [grnItems, setGrnItems] = useState<
    { itemId: string; quantity: number; totalQuantity: number; expiryDate?: string; rejectedQuantity?: number; reasonForRejection?: string }[]
  >([]);

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
      setGrnStatus(fetchedGrnData.status);
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

  const _handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

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
  
      grnAttachments.forEach((file, index) => {
        formData.append("asnAttachments", file, file.name);
      });
      setLoading(true);
  
      const _updatedGrn = await updateGrnApi.mutateAsync(formData);
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
      setGrnStatus(grnData.status);
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
    return <div className="p-6 text-center">GRN not found.</div>;
  }

  const grnItemColumns = [
    {
      name: "Item No",
      selector: (row: { itemId: string }) => {
        const item = grnData.GoodReceiptNoteItem.find((i) => i.itemId === row.itemId);
        return item?.item?.itemCode || "";
      },
    },
    {
      name: "Material Description",
      selector: (row: { itemId: string }) => {
        const item = grnData.GoodReceiptNoteItem.find((i) => i.itemId === row.itemId);
        return item?.item?.MasterGeneric?.name || "";
      },
    },
    {
      name: "Total Quantity",
      selector: (row: { itemId: string; totalQuantity: number }) => row.totalQuantity,
    },
    {
      name: "Received Quantity",
      cell: (row: { itemId: string; quantity: number }) => (
        <input
          type="number"
          value={row.quantity}
          onChange={(e) => handleItemChange(row.itemId, "quantity", e.target.value)}
          disabled={grnData.status !== "PENDING"}
          className="border rounded p-1 w-20"
        />
      ),
    },
    {
      name: "Rejected Quantity",
      cell: (row: { itemId: string; rejectedQuantity?: number }) => (
        <input
          type="number"
          value={row.rejectedQuantity || 0}
          onChange={(e) => handleItemChange(row.itemId, "rejectedQuantity", e.target.value)}
          disabled={grnData.status !== "PENDING"}
          className="border rounded p-1 w-20"
        />
      ),
    },
    {
      name: "Rejection Remark",
      cell: (row: { itemId: string; reasonForRejection?: string; rejectedQuantity?: number }) => (
        <input
          type="text"
          value={row.reasonForRejection || ''}
          onChange={(e) => handleItemChange(row.itemId, "reasonForRejection", e.target.value)}
          disabled={grnData.status !== "PENDING" || (row.rejectedQuantity || 0) <= 0}
          placeholder="Reason for rejection"
          className="border rounded p-1 w-full"
        />
      ),
    },
    {
      name: "Expiry Date",
      selector: (row: { itemId: string; expiryDate: string }) => row.expiryDate ? formatDate(row.expiryDate) : "",
    },
  ];

  return (
    <div className="bg-gray-50 p-5 h-full max-h-full overflow-y-auto custom-scrollbar hide-scrollbar">
      <div className="bg-white w-full mt-2">
        <div className="flex flex-row justify-between p-6">
          <TitleText children={"Update Goods Receipt Note"} />
          {hasPermission("GRN View export") && (<SecondaryButton
            title="Export"
            leftIcon={<MdOutlineFileDownload size={16} />}
            onClick={() => {}}
            variant="custom"
            customVariant={{
              borderColor: "none",
              textColor: "text-black",
              hoverColor: "",
              bgColor: "bg-gray-100",
            }}
          />)}
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2 bg-white p-4 rounded-md">
        <div className="flex flex-col gap-2 p-4">
        <div className="flex gap-2 justify-between">
            <p className="text-md font-bold">GRN Number.</p>
            <p className="text-md font-normal">{grnData.grnNumber}</p>
          </div>
          <div className="flex gap-2 justify-between">
            <p className="text-md font-bold">ASN Number.</p>
            <p className="text-md font-normal">{grnData.asn?.asnNumber ?? 'N/A'}</p>
          </div>
          <div className="flex gap-2 justify-between">
            <p className="text-md font-bold">Shipment Reference.</p>
            <p className="text-md font-normal">{grnData.asn?.shipmentReference ?? 'N/A'}</p>
          </div>
          </div>
          <div className="flex flex-col gap-2 p-4">
          <div className="flex gap-2 justify-between">
            <p className="text-md font-bold">ASN Date.</p>
            <p className="text-md font-normal">{grnData.asn?.createdAt ? formatDate(grnData.asn?.createdAt) : "-"}</p>
          </div>
          <div className="flex gap-2 justify-between">
            <p className="text-md font-bold">Vendor.</p>
            <p className="text-md font-normal">{grnData.vendor.tempName}</p>
          </div>
          <div className="flex gap-2 justify-between">
            <p className="text-md font-bold">PO Reference No.</p>
            <p className="text-md font-normal">{grnData.asn?.purchaseOrder?.purchaseOrderNumber || grnData.Invoice?.length > 0 ? grnData.Invoice[0]?.po?.purchaseOrderNumber : 'N/A'  }</p>
          </div>
          </div>
        </div>

        <div className="m-3 bg-white">
          <h3 className="text-lg font-medium mb-4">GRN Items</h3>
          <ReactTable
            data={grnItems}
            columns={grnItemColumns}
            loading={false}
            rowsPerPageText={10}
            isServerPropsDisabled={true}
          />
        </div>

        <div className="p-4 bg-white">
          <TitleText children={"GRN Attachments"} />
          <div className="flex flex-col gap-2">
            {grnData.GRNAttachment.length > 0 ? (
              grnData.GRNAttachment.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                              <Paperclip className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium text-gray-900">{attachment.fileName}</p>
                                              <p className="text-xs text-gray-500">{attachment.fileType} </p>
                                            </div>
                                          </div>
                                          <button 
                                            className="text-blue-600 hover:text-blue-700 transition-colors"
                                            onClick={() => handleDownloadAttachment(attachment)}
                                          >
                                            <Download className="w-4 h-4" />
                                          </button>
                                        </div>
              ))
            ) : (
              <SubTitleText children={"No GRN attachments available."} />
            )}
          </div>
        </div>

        <div className="p-4 bg-white">
          <TitleText children={"GRN Details"} />

          <div className="flex flex-row  gap-2">
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
              value={securityNumber || '' }
              setValue={setSecurityNumber}
              placeholder="Enter the security number"
              disabled={grnData.status !== "PENDING"}
              additionalClasses="w-full"
            />
          </div>  
          <div className="flex flex-col gap-2">
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

        <div className="p-4 bg-white">
          <TitleText children={"Status Tracking"} />
          <div className="flex flex-col gap-3">
            <SubTitleText children={"GRN Status"} />
            <span
              className={`p-2 rounded-md w-[120px] text-center ${
                grnData.status === "COMPLETED"
                  ? "text-green-600 bg-green-100"
                  : grnData.status === "REJECTED"
                  ? "text-red-600 bg-red-100"
                  : "text-yellow-600 bg-yellow-100"
              }`}
            >
              {grnData.status}
            </span>
          </div>
        </div>

        {grnData.status === "PENDING" && (
          <div className="flex flex-row gap-3 justify-end mt-4">
            <SecondaryButton
              title="Cancel"
              onClick={handleCancel}
            />
            <PrimaryButton
              isLoading={loading}
              title="Submit GRN"
              onClick={handleUpdateGrn}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateGRN;
