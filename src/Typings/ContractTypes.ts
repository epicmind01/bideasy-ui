export interface ContractData {
  id: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  arc?: {
    arcNumber: string;
  };
  rfq?: {
    title: string;
  };
  item?: {
    itemCode: string;
    brand?: {
      name: string;
    };
  };
  arcVendor?: {
    tempCompanyName: string;
  };
  createdBy?: {
    name: string;
  };
}

export interface ContractItemData {
  id: string;
  contractId: string;
  contractNumber: string;
  itemCode: string;
  itemDescription: string;
  vendorName: string;
  arcNumber: string;
  createdAt: string;
  endDate: string;
  status: string;
}

export interface ContractListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}

export interface ContractListResponse {
  data: ContractData[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ContractItemListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}

export interface ContractItemListResponse {
  data: ContractItemData[];
  total: number;
  page: number;
  pageSize: number;
  totalRecords: number;
  totalContractsGroupByStatus?: Array<{
    status: string;
    _count: {
      id: number;
    };
  }>;
}

export interface ContractResponse {
  message: string;
  data: ContractData[];
  totalRecords: number;
  currentPage: number;
  totalPages: number;
}

export interface ContractSingleResponse {
  message: string;
  data: ContractData;
}

export interface ContractpayloadData {
  price: string;
  createdAt: string;
  createdBy: any;
}
