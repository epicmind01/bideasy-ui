export interface PurchaseRequestItem {
  id: string;
  quantity: number;
  total: number;
  price: number;
  vendorId: string;
  vendor?: {
    id: string;
    tempName: string;
  };
  item: {
    id: string;
    itemCode: string;
    itemTag?: string;
    MasterGeneric?: {
      name: string;
    };
    MasterCategory?: {
      name: string;
    };
    MasterBrand?: {
      name: string;
    };
    unitOfMeasure?: string;
    MasterItemPreviousRecord?: Array<{
      previousCostPrice: number;
      vendorId: string;
      vendor?: {
        tempName: string;
      };
    }>;
  };
  itemId: string;
  remarks?: string;
  gstPercentage?: number;
  tax?: number;
}

export interface PurchaseRequestApproval {
  id: string;
  status: string;
  buyerId: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseRequest {
  id: string;
  purchaseRequestNumber: string;
  title: string;
  organisationId: string;
  organisation?: {
    name: string;
  };
  companyCodeId: string;
  departmentid: string;
  vendorId: string;
  vendor?: {
    id: string;
    tempName: string;
  };
  plantId: string;
  plant: {
    name: string;
    address?: string;
  };
  department?: {
    name: string;
  };
  PurchaseRequestItem: PurchaseRequestItem[];
  contractNumber: string;
  status: string;
  isDraft?: boolean;
  plantAddress?: string;
  deliveryDate: string;
  purpose?: string;
  remarks?: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  requisitionType: string;
  PurchaseRequestApproval: PurchaseRequestApproval[];
  poCount?: string;
}

export interface PurchaseOrder {
  id: string;
  purchaseOrderNumber: string;
  qtyRequested: number;
  isEditable: boolean;
  title: string;
  organisationId: string;
  organisation?: {
    name: string;
  };
  companyCodeId: string;
  vendorId: string;
  vendor?: {
    id: string;
    tempName: string;
  };
  auctionId: string;
  auction?: any;
  plantId: string;
  estimateDeliveryDate?: string;
  paymentTerms?: string;
  deliveryAddress?: string;
  deliveryDate?: string;
  shippingTerms?: string;
  specialInstructions?: string;
  acknowledgmentDate?: string;
  partialFulfillmentAllowed?: boolean;
  plant: {
    name: string;
    address?: string;
  };
  PurchaseOrderItem: PurchaseRequestItem[];
  contractNumber: string;
  status: string;
  isDraft?: boolean;
  purchaseRequest: PurchaseRequest;
  createdAt: string;
}

export interface PurchaseOrderListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}

export interface PurchaseOrderListResponse {
  data: PurchaseOrder[];
  total: number;
  page: number;
  pageSize: number;
  draft?: number;
  pending?: number;
  in_approval?: number;
  approved?: number;
  rejected?: number;
  acknowledged?: number;
  processed?: number;
  completed?: number;
  all?: number;
}

export interface PurchaseOrderPayload {
  id?: string;
  title?: string;
  organisationId?: string;
  companyCodeId?: string;
  departmentid?: string;
  vendorId?: string;
  plantId?: string;
  items?: any[];
  contractNumber?: string;
  isDraft?: boolean;
  isEditable?: boolean;
  status?: string;
}

export interface AdvanceSimpmentNote {
  id: string;
  title?: string;
  asnNumber: string;
  poId: string;
  purchaseOrder: {
    id: string;
    purchaseOrderNumber: string;
    title?: string;
  };
  vendorId: string;
  vendor: {
    id: string;
    tempName?: string;
  };
  shipmentReference?: string;
  expectedDeliveryDate?: string;
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
      id: string;
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
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

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
  GoodReceiptNoteItem: {
    id: string;
    grnId: string;
    itemId: string;
    quantity: number;
    totalQuantity: number;
    expiryDate?: string;
    quantityRejected?: number;
    reasonForRejection?: string;
    item: any;
  }[];
  GRNAttachment: {
    id: string;
    grnId: string;
    fileUrl?: string;
    fileName?: string;
    fileType?: string;
  }[];
  vendor: any;
  Invoice: Invoice[];
  qtyOrdered: number;
  qtyReceived: number;
  qtyPending: number;
}

export interface Invoice {
  id: string;
  grnId: string;
  invoiceNumber: string;
  poId: string;
  po: PurchaseOrder;
  vendorId: string;
  status: "PENDING" | "IN_APPROVAL" | "APPROVED" | "PAID" | "REJECTED" | "CREDIT_NOTE" | "COMPLETED";
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  orderTotal?: number;
  grn: GoodReceiptNote;
  vendor: { id: string; tempName: string; details: any };
  totalAmount?: number;
  totalTaxAmount?: number;
  vendorAttachment?: string[];
  InvoiceItem: {
    id: string;
    invoiceId: string;
    itemId: string;
    quantity: number;
    totalQuantity: number;
    expiryDate?: string;
    unitPrice: number;
    item: {
      id: string;
      itemCode: string;
      unitPrice?: number;
      MasterGeneric?: { id: string; name: string };
    };
    comparison?: {
      poQuantity: number;
      poPrice: number;
      remainingQuantity: number;
      quantityDiff: number;
      priceDiff: number;
      hasQuantityExceeded: boolean;
      hasQuantityMismatch: boolean;
      hasPriceMismatch: boolean;
    };
  }[];
  InvoiceAttachment: {
    id: string;
    invoiceId: string;
    fileUrl: string;
    fileName: string;
    fileType?: string;
  }[];
  InvoiceApproval?: {
    id: string;
    invoiceId: string;
    buyerId: string;
    buyer?: {
      id: string;
      name: string;
      email: string;
    };
    departmentId: string;
    department?: {
      id: string;
      name: string;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
  }[];
}
