import { MdOutlineFileDownload } from "react-icons/md";
import { PrimaryButton } from "../../components/ui/button/PrimaryButton";
import { SecondaryButton } from "../../components/ui/button/SecondaryButton";
import { TitleText } from "../../components/ui/title-text/TitleText";
import { SubTitleText } from "../../components/ui/title-text/SubTitleText";
import { SVGIcon } from "../../components/SVGIcon";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { AdvanceSimpmentNoteItem, AsnAttachment, useCreateGrnApi, useGetAdvanceSimpmentNoteByIdApi } from "../../hooks/API/ASNApi";
import toast from "react-hot-toast";
import { formatDate, hasPermission } from "../../utils/Helpers";
import { ReactTable } from "../../components/ui/table/ReactTable";
import { FlexLoader } from "../../components/ui/loader/FlexLoader";

const AsnView = () => {
  const { id } = useParams<{ id: string }>();
  const [asnData, setAsnData] = useState<any | null>(null);
  const [attachments, setAttachments] = useState<AsnAttachment[]>([]);
  const navigate = useNavigate();
  const { data: fetchedAsnData, isLoading, error } = useGetAdvanceSimpmentNoteByIdApi(id || '');
  const createGrnApi = useCreateGrnApi();

  useEffect(() => {
    if (error) {
      toast.error("Failed to load ASN details.");
    }
    if (fetchedAsnData) {
      setAsnData(fetchedAsnData);
      setAttachments(fetchedAsnData.ASNAttachment || []);
    }
  }, [fetchedAsnData, error]);

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const handleCreateGrn = async () => {
    if (!id) {
      toast.error("ASN ID is missing.");
      return;
    }

    try {
    const res = await createGrnApi.mutateAsync({
        asnId: id,
      });
      toast.success("Goods Receipt Note created successfully.");
      navigate('/grn-list/'+res.data.grnId);
    } catch (err) {
      toast.error("Failed to create GRN.");
      console.error(err);
    }
  };
  
  if (isLoading) {
    return <FlexLoader />;
  }

  if (!asnData) {
    return <div className="p-6 text-center">ASN not found.</div>;
  }

  const columns = [
    {
      name: "Item No",
      selector: (row: AdvanceSimpmentNoteItem) => row.item?.itemCode || "",
    },
    {
      name: "Material Description",
      selector: (row: AdvanceSimpmentNoteItem) => row?.item?.MasterGeneric?.name || "",
    },
    {
      name: "Total",
      selector: (row: AdvanceSimpmentNoteItem) => row.totalQuantity,
    },
    {
      name: "Quantity",
      selector: (row: AdvanceSimpmentNoteItem) => row.quantity,
    },
    {
      name: "Expiry Date",
      selector: (row: AdvanceSimpmentNoteItem) => (row.expiryDate ? formatDate(row.expiryDate) : ""),
    },
  ];

  return (
    <div className="bg-gray-50 p-5 h-full max-h-full overflow-y-auto custom-scrollbar hide-scrollbar">
      <div className="bg-white w-full mt-2">
        <div className="flex flex-row justify-between p-6">
          <TitleText children={"ASN View"} />
          {hasPermission("ASN view export") && ( <SecondaryButton
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
            <p className="text-md font-bold">Shipment Reference No.</p>
            <p className="text-md font-normal">{asnData.shipmentReference}</p>
          </div>
          <div className="flex gap-2 justify-between">
             <p className="text-md font-bold">ASN Date</p>
            <p className="text-md font-normal">{asnData.createdAt ? formatDate(asnData.createdAt) : "-"}</p>
          </div>
          <div className="flex gap-2 justify-between">
            <p className="text-md font-bold">Vendor</p>
            <p className="text-md font-normal">{asnData.vendor?.tempName}</p>
          </div>
          <div className="flex gap-2 justify-between">
            <p className="text-md font-bold">PO Reference No.</p>
            <p className="text-md font-normal">{asnData.purchaseOrder?.purchaseOrderNumber}</p>
          </div>
          <div className="flex gap-2 justify-between">
            <p className="text-md font-bold">Expected Delivery Date</p>
            <p className="text-md font-normal">{asnData.expectedDeliveryDate ? formatDate(asnData.expectedDeliveryDate) : "-"}</p>
          </div>
          <div className="flex gap-2 justify-between">
            <p className="text-md font-bold">Shipment Method</p>
            <p className="text-md font-normal">{asnData.shipmentMethod || "-"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <div className="flex gap-2 justify-between">
            <p className="text-md font-bold">Carrier Name</p>
            <p className="text-md font-normal">{asnData.carrierName || "-"}</p>
          </div>
          <div className="flex gap-2 justify-between">
            <p className="text-md font-bold">Tracking Number</p>
            <p className="text-md font-normal">{asnData.trackingNumber || "-"}</p>
          </div>
          <div className="flex gap-2 justify-between">
            <p className="text-md font-bold">Delivery Address</p>
            <p className="text-md font-normal">{asnData.deliveryAddress || "-"}</p>
          </div>
          <div className="flex gap-2 justify-between">
            <p className="text-md font-bold">Instruction</p>
            <p className="text-md font-normal">{asnData.loadingInstruction || "-"}</p>
          </div>
          </div>
        </div>

        <div className="m-3 bg-white">
          <h3 className="text-lg font-medium mb-4">Items</h3>
          <ReactTable
            data={asnData.AdvanceSimpmentNoteItem || []}
            columns={columns}
            loading={false}
            rowsPerPageText={10}
            isServerPropsDisabled={true}
          />
        </div>

      </div>

      <div className="p-4 bg-white">
        <TitleText children={"Attachments"} />
        <div className="flex flex-col gap-4">
          {attachments.length > 0 ? (
            attachments.map((attachment, index) => (
              <div key={index} className="flex flex-row gap-4 items-center">
                <SubTitleText children={`Attachment ${index + 1}:`} className="w-32" />
                <div className="flex flex-row gap-2 items-center">
                  <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                    <SVGIcon Icon={() => <div>👁️</div>} className="text-blue-600" />
                    <SubTitleText children={"View"} />
                  </a>
                </div>
                <div
                  className="flex flex-row gap-2 items-center cursor-pointer"
                  onClick={() => handleDownload(attachment.fileUrl || "", attachment.fileName || "")}
                >
                  <SVGIcon Icon={() => <div>⬇️</div>} />
                  <SubTitleText children={"Download"} />
                </div>
              </div>
            ))
          ) : (
            <SubTitleText children={"No attachments available."} />
          )}
        </div>
      </div>

      <div className="p-4 bg-white">
        <TitleText children={"Status Tracking"} />
        <div className="flex flex-col gap-3">
          <SubTitleText children={"Status"} />
          <span
            className={`p-2 rounded-md w-[120px] text-center ${
              asnData.status === "COMPLETED" ? "text-green-600 bg-green-100" : "text-yellow-600 bg-yellow-100"
            }`}
          >
            {asnData.status || "PENDING"}
          </span>
        </div>
      </div>

      <div className="flex justify-end mt-4">
         {hasPermission("ASN view create") && ( <PrimaryButton
          onClick={() => {handleCreateGrn()}}
          title={"Create GRN"}
        />)}
      </div>
    </div>
  );
};

export default AsnView;
