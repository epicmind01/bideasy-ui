// ASN (Advance Shipment Notice) Types

export interface AdvanceSimpmentNote {
  id: string;
  title?: string;
  asnNumber: string;
  poId: string;
  vendorId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: AdvanceSimpmentNoteItem[];
  attachments?: AsnAttachment[];
}

export interface AdvanceSimpmentNoteItem {
  id: string;
  asnId: string;
  itemId: string;
  quantity: number;
  receivedQuantity?: number;
  itemName: string;
  itemCode: string;
  unit: string;
  price: number;
}

export interface AsnAttachment {
  id: string;
  asnId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

export interface ASNListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  vendorId?: string;
}

export interface ASNListResponse {
  asns: AdvanceSimpmentNote[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}
