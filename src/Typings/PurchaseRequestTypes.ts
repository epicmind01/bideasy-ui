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

export interface PurchaseRequestData {
  id: string;
  purchaseRequestNumber: string;
  title: string;
  organisationId: string;
  organisation?: {
    name: string;
  };
  companyCodeId: string;
  departmentid: string;
  department?: {
    name: string;
  };
  vendorId: string;
  plantId: string;
  plant: {
    name: string;
    address?: string;
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

export interface PurchaseRequestListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}

export interface PurchaseRequestListResponse {
  data: PurchaseRequestData[];
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

export interface PurchaseRequestPayload {
  id?: string;
  title: string;
  organisationId: string;
  companyCodeId?: string;
  vendorId?: string;
  plantId: string;
  plantAddress?: string;
  deliveryDate: string;
  purpose?: string;
  remarks?: string;
  priority: string;
  requisitionType: string;
  items: any[];
  contractNumber: string;
  isDraft?: boolean;
}
