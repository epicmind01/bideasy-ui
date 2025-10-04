export interface AuctionListResponse {
    message: string;
    data: AuctionData[];
    total: number;
    totalDraft: number;
    totalScheduled: number;
    totalLive: number;
    totalClosed: number;
    totalAwarded: number;
    totalDeleted: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
}

export interface AuctionResponse {
  message: string;
  auction: AuctionData;
}

export interface AuctionData {
  auctionCategory: {name: string; id: string};
  plant: any;
  id: string;
  buyerId: string;
  name: string;
  startTime: string;
  endTime: string;
  status: string;
  eventCode: string;
  templateCode: string | null;
  termsAndConditions: string;
  categoryId: string;
  plantId: string | null;
  itemType: string;
  auctionBehavior: string;
  batchName: string | null;
  batchCode: string | null;
  leadingPrice: number;
  winnerAnnounced: string;
  batchScheduleBehavior: string | null;
  batchStart: string | null;
  lineItemRunningTimeDays: number | null;
  lineItemRunningTimeHours: number | null;
  lineItemRunningTimeMinutes: number | null;
  autoExtension: boolean;
  lastBidExtension: string | null;
  overallExtension: string;
  extension: string | null;
  extendTime: string;
  minimumBDPrice: number | null;
  createdAt: string;
  updatedAt: string;
  BusinessDepartment: string;
  deletedAt: string | null;
  updatedById: string | null;
  steps: AuctionStep[];
  coCreators: any[];
  observers: any[];
  eventDocuments: any[];
  vendorDocuments: any[];
  auctionInfo: AuctionInfo;
  buyer: Buyer;
  itemsSheets: ItemSheet[];
  participants: Participant[];
  purchaseOrder: PurchaseOrder[];
}

export interface PurchaseOrder {
  id: string;
  name: string;
  code: string;
}

export type AuctionStatus = 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'CLOSED' | 'AWARDED' | 'DELETED';


export interface AuctionListParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }

export interface AuctionStep {
  id: string;
  stepName: string;
  step: number;
  auctionId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuctionInfo {
  infoType: string;
  id: string;
  auctionId: string;
  itemHasFirstQuote: boolean;
  bidderCanBidAgainst: string;
  displayLeadingPriceToVendors: boolean;
  minBidDifference: number;
  minBidDifferenceContractors: number;
  minBidDifferenceSelf: number;
  bidDifferenceType: string | null;
  mcdPrice: number | null;
  maxBidDifferenceEnabled: boolean;
  maxBidDifferencePrice: number;
  chanceToMatchL1: boolean;
  showLeadingPriceToVenders: boolean;
  showLeadingPriceToTop3Venders: boolean;
  reservedBuyingSelling: string;
  reserveBuyingSellingPrice: number;
  preferentialTreatment: string | null;
  vendorComments: string | null;
  participationRankDisplay: string;
  bidderUploadAdditionalDocuments: boolean;
  singleBidEnabled: boolean;
  allowZeroItemBidPrice: boolean;
  enableBatchRelaunch: boolean;
  maskVendorCompanyNames: boolean;
  isVendorBidPriceMasked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Buyer {
  name: string;
  email: string;
  headId: string;
  head: {
    name: string;
    email: string;
  };
}

export interface ItemHeader {
  id: string;
  itemsSheetId: string;
  name: string;
  type: string;
  required: boolean;
  position: number;
}

export interface Item {
  id: string;
  itemsSheetId: string;
  data: Record<string, any>;
  isEditable: boolean;
  isPreferred: boolean;
}

export interface ItemSheet {
  id: string;
  auctionId: string;
  name: string;
  description: string;
  position: number;
  installationPrice: boolean;
  isEditable: boolean;
  isPreferred: boolean;
  itemHeaders: ItemHeader[];
  items: Item[];
}

export interface Participant {
  id: string;
  name: string;
  rank: number;
  response: string;
  auctionResult: string;
  status: string;
  bidRecords: any[];
  vendor: {
    id: string;
    vendorCode: string;
    email: string;
    tempName: string;
    tempCompanyName: string;
    tempCity: string;
    phone: string | null;
  };
}

export type CloneAuctionPayload = {
  auctionId: string;
  name: string;
  startTime?: string;
  endTime?: string;
};