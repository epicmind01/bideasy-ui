export interface GoodReceiptNote {
  id: string;
  grnNumber: string;
  asn: AdvanceSimpmentNote;
  asnId: string;
  vendorId: string;
  status: "PENDING" | "COMPLETED" | "REJECTED";
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  receivedByDate?: string;
  securityNumber?: string;
  GoodReceiptNoteItem: GoodReceiptNoteItem[];
  GRNAttachment: GRNAttachment[];
  vendor: {
    id: string;
    tempName: string;
    email?: string;
  };
  Invoice?: any[];
}

export interface GoodReceiptNoteItem {
  id: string;
  grnId: string;
  itemId: string;
  quantity: number;
  totalQuantity: number;
  quantityRejected?: number;
  reasonForRejection?: string;
  expiryDate?: string;
  item: {
    id: string;
    itemCode: string;
    MasterGeneric?: {
      name: string;
    };
  };
}

export interface GRNAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
}

export interface AdvanceSimpmentNote {
  id: string;
  title?: string;
  asnNumber: string;
  poId: string;
  purchaseOrder: {
    id: string;
    purchaseOrderNumber: string;
  };
  vendorId: string;
  vendor: {
    id: string;
    tempName: string;
  };
  shipmentReference: string;
  expectedDeliveryDate?: string;
  ewayBillNumber?: string;
  acknowledgedBy?: string;
  comments?: string;
  carrierName?: string;
  trackingNumber?: string;
  deliveryAddress?: string;
  loadingInstruction?: string;
  shipmentMethod?: string;
  status: "PENDING" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  AdvanceSimpmentNoteItem: AdvanceSimpmentNoteItem[];
  ASNAttachment: AsnAttachment[];
  GoodReceiptNote?: {
    id: string;
    grnNumber: string;
  }[];
}

export interface AdvanceSimpmentNoteItem {
  id: string;
  asnId: string;
  itemId: string;
  item: {
    id: string;
    itemCode: string;
    MasterGeneric?: {
      name: string;
    };
  };
  quantity: number;
  totalQuantity: number;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AsnAttachment {
  id: string;
  asnId: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface GoodReceiptNoteResponse {
  message: string;
  data: {
    grns: GoodReceiptNote[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface GrnDetailResponse {
  message: string;
  grn: GoodReceiptNote;
}

export interface AdvanceSimpmentNoteResponse {
  message: string;
  data: {
    advanceSimpmentNotes: AdvanceSimpmentNote[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface AdvanceSimpmentNoteDetailResponse {
  message: string;
  asn: AdvanceSimpmentNote;
}

export interface AsnPayload {
  asnId?: string;
}
