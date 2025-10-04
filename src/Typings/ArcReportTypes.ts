export interface ArcReportData {
  id: string;
  arcNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  rfqEvent?: {
    id: string;
    eventCode: string;
    title: string;
    department?: {
      name: string;
    };
    technicalSpec?: {
      endDate: string;
      paymentTerms: string;
    };
  };
  rfqItems?: Array<{
    id: string;
    rfqItem: {
      item: {
        MasterGeneric?: {
          name: string;
        };
        description?: string;
        itemCode?: string;
      };
    };
    vendors?: Array<{
      id: string;
      rank: number;
      preferedVendorRank?: number;
      status: string;
      brandName?: string;
      MRP?: number;
      counterOfferPrice?: number;
      vendorOffer?: {
        vendor?: {
          details?: {
            companyName: string;
          };
        };
        vendorItemOffers?: Array<{
          costPrice: number;
        }>;
      };
    }>;
  }>;
  approvals?: Array<{
    id: string;
    status: string;
    approvedBy?: {
      name: string;
      email: string;
    };
    approvedById?: string;
  }>;
}

export interface ArcReportListParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}

export interface ArcReportListResponse {
  data: ArcReportData[];
  total: number;
  page: number;
  pageSize: number;
  pending?: number;
  in_approval?: number;
  approved?: number;
  rejected?: number;
  all?: number;
}
