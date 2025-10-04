export interface RFQListResponse {
  message: string;
  data: RFQData[];
  total: number;
  counts: {
    ALL: number;
    DRAFT: number;
    PUBLISHED: number;
    IN_NEGOTIATIONS: number;
    IN_APPROVAL: number;
    COMPLETED: number;
    CANCELLED: number;
  };
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface RFQData {
  id: string;
  eventCode: string;
  title: string;
  overAllStatus: string;
  noOfVendors: number;
  arcItems: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
  buyerId: string;
  department?: {
    id: string;
    name: string;
  };
  technicalSpec?: {
    startDate: string;
    endDate: string;
  };
  _count?: {
    vendors: number;
    vendorOffers: number;
  };
}

export interface RFQStats {
  activeRfqCount: number;
  totalResponses: number;
  averageResponseRate: number;
  totalItems: number;
  counts: {
    ALL: number;
    DRAFT: number;
    PUBLISHED: number;
    IN_NEGOTIATIONS: number;
    IN_APPROVAL: number;
    COMPLETED: number;
    CANCELLED: number;
  };
}

export interface RFQListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  category?: string[];
  minAmount?: number;
  maxAmount?: number;
  statusArr?: string[];
}

export type RFQStatus = 'DRAFT' | 'PUBLISHED' | 'IN_NEGOTIATIONS' | 'IN_APPROVAL' | 'COMPLETED' | 'CANCELLED';

// Vendor Offer Types
export interface VendorOffer {
  id: string;
  vendorId: string;
  vendor: {
    id: string;
    companyName: string;
    vendorCode: string;
    email: string;
  };
  status: 'PENDING' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'COUNTER_OFFER';
  submittedAt?: string;
  totalAmount: number;
  totalOfferPrice: number;
  itemCount: number;
  round: number;
  rank: number;
  preferedVendor: number;
  lastModified: string;
  itemOffers?: VendorItemOffer[];
}

export interface VendorItemOffer {
  id: string;
  costPrice: number;
  MRP: number;
  brandName?: string;
  status: string;
  rfqItemId: string;
  currentSaving?: {
    absolute: number;
    percentage: number;
    price: number;
  };
  lastVendorPrice?: {
    price: number;
    absoluteChange: number;
    percentageChange: number;
  };
}

// RFQ Round Types
export interface RFQRound {
  id: string;
  roundNumber: number;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  description?: string;
  vendorCount: number;
  totalOffers: number;
  averagePrice: number;
  bestPrice: number;
  savings: number;
  savingsPercentage: number;
  createdAt: string;
  updatedAt: string;
}

// RFQ Details Types
export interface RFQDetails extends RFQData {
  items: ProductItem[];
  collaborators: Collaborator[];
  technicalSpec: {
    startDate: string;
    endDate: string;
    paymentTerms: string;
  };
  buyerName: string;
}

export interface ProductItem {
  id: string;
  itemCode: string;
  itemName: string;
  brandName?: string;
  annualVolumeQuantity: number;
  MasterBrand?: { name: string };
  MasterGeneric?: { name: string };
  MasterCategory?: { name: string };
  itemTag?: string;
}

export interface Collaborator {
  id: string;
  collaborator: {
    id: string;
    name: string;
    email: string;
  };
  role: 'OBSERVER' | 'CO_BUYER' | 'BUYER';
}

// Comparison Types
export interface ComparisonData {
  topVendors: VendorOffer[];
  items: ComparisonItem[];
  totalItems: number;
  totalVendors: number;
}

export interface ComparisonItem {
  id: string;
  name: string;
  rfqItemId: string;
  itemCode: string;
  itemTag?: string;
}

// API Response Types
export interface RFQDetailsResponse {
  message: string;
  data: RFQDetails;
}

export interface VendorOffersResponse {
  message: string;
  data: VendorOffer[];
  total: number;
}

export interface RFQRoundsResponse {
  message: string;
  data: RFQRound[];
  total: number;
}

export interface ComparisonDataResponse {
  message: string;
  data: ComparisonData;
}

// Create/Update Types
export interface CreateRFQData {
  title: string;
  department: string;
  itemType: string;
  items: ProductItem[];
  startDate: string;
  endDate: string;
  paymentTerms: string;
  selectedVendors: string[];
  preferredVendors: Array<{
    plantCode: string;
    distributorName: string;
  }>;
  collaborators: string[];
}

export interface CreateRoundData {
  rfqId: string;
  description: string;
  endDate: string;
}

export interface UpdateRoundData {
  roundId: string;
  status?: string;
  description?: string;
  endDate?: string;
}

export interface CounterOfferData {
  rfqEventId: string;
  vendorId: string;
  revisedItemPrices: Array<{
    rfqItemId: string;
    revisedCostPrice: number;
    revisionRemarks: string;
  }>;
}

export interface ArcApprovalData {
  vendorOfferId: string;
  rfqItemId: string;
  rank: number;
  preferedVendorRank: number;
  remarks: string;
}

// Additional types from bideasy_buyer
export interface TopVendor {
  id: string;
  rfqEventId: string;
  vendorId: string;
  packagingCharges: number;
  freightCost: number;
  insuranceCost: number;
  miscellaneousCost: number;
  status: string;
  round: number;
  rank: number;
  preferedVendor: number;
  createdAt: string;
  submitOffer: boolean;
  offerRevison: boolean;
  vendor: {
    id: string;
    vendorCode: string;
    details: {
      companyName: string;
      contactPersons: any[];
    };
  };
  itemOffers: VendorItemOffer[];
  totalOfferPrice: number;
}

export interface RfqEventOffersVendorDetail {
  rfqEventDetails: RFQDetails;
  round: number;
  offerRevisons: boolean;
  submitOffer: boolean;
  vendorDetails: {
    vendorCode: string;
    tempCompanyName: string;
    details: {
      contactPersons: any[];
    };
  };
  totalRFQAmount: number;
  itemOffers: ItemsDetails[];
}

export interface ItemsDetails {
  rdqItemID: string;
  itemCode: string;
  brandDescription: string;
  genericName: string;
  annualVolumeQuantity: number;
  brandName: string;
  costPrice: number;
  previousYearCostPrice: number;
  previousCostPrice: number;
  revisedPrice: number;
  previousMRP: number;
  mrp: number;
  gst: number;
  status: string;
  offerRevison: boolean;
  submitOffer: boolean;
  currentL1: number;
}

export interface ItemDetails {
  id: string;
  itemCode: string;
  generic: string;
  material: string;
  materialDescription?: string;
  mfgCode: string;
  manufacturerName: string;
  category: string;
  itemTag: string;
  matlGroup: string;
  unitOfMeasure: string;
  packSize: string;
  mrp: number;
  previousCostPrice: number;
  previousMRP: number;
  createdAt: Date;
  updatedAt: Date;
  brandName: string;
  MasterBrand: {
    name: string;
  };
  MasterGeneric: {
    name: string;
  };
  MasterCategory: {
    name: string;
  };
  MasterItemPreviousRecord: {
    price: number;
    year: number;
  }[];
}

export interface VendorOfferDetails {
  vendor: any;
  id: string;
  item: ItemDetails;
  _count: {
    arcReportItems: number;
  };
  vendorItemOffers?: {
    id: string;
    costPrice: number;
    vendorOfferId: string;
    rfqItemId: string;
    brandName?: string;
    status: string;
    MRP: number;
    manufacturerName: string;
    gstPercentage: number;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

// API Payload types
export interface IAddRfqReviseOfferPayload {
  rfqEventId: string;
  vendorId: string;
  revisedItemPrices: {
    rfqItemId: string;
    revisedCostPrice: number;
    revisionRemarks: string;
  }[];
}

export interface IAddRfqCollectiveReviseOfferPayload {
  vendorOffers: {
    vendorId: string;
    rfqEventId: string;
    revisedItemPrices: {
      rfqItemId: string;
      revisedCostPrice: number;
      revisionRemarks: string;
    }[];
  }[];
}

export interface IApproveRfqReviseOfferPayload {
  rfqEventId: string;
  vendorId: string;
  rfqItemId: string;
  status: string;
  remarks?: string;
}

export interface IArcReportsActionpayload {
  rfqEventId: string;
  itemsWithTopVendors: {
    vendorOfferId: string;
    rfqItemId: string;
    rank: number;
    preferedVendorRank: number;
    remarks: string;
  }[];
  rfqItemIds: string[];
  approvedById: string;
}

export interface IStatusArcReportspayload {
  arcReportId: string;
  status: string;
  remarks?: string;
}
