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
  vendor: { 
    id: string; 
    tempName: string; 
    details: VendorDetails 
  };
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
    taxRate?: number;
    batchNumber?: string;
    mrp?: number;
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
    remarks?: string;
    createdAt: string;
    updatedAt: string;
  }[];
}

export interface InvoiceResponse {
  message: string;
  data: {
    invoices: Invoice[];
    totalCount: number;
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  };
}

export interface ApproveInvoicePayload {
  invoiceId: string;
  approvedById: string;
  status: 'APPROVED' | 'REJECTED' | 'REVISED';
  remarks?: string;
  documentUrls?: string[];
}

// Import required types from other files
export interface PurchaseOrder {
  id: string;
  purchaseOrderNumber: string;
  status: string;
  // Add other required fields as needed
}

export interface GoodReceiptNote {
  id: string;
  grnNumber: string;
  status: string;
  // Add other required fields as needed
}

export interface VendorDetails {
  accountHolder?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  // Add other required fields as needed
}

