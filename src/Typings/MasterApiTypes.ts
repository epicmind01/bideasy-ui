
export interface IVendorSignUpPayload {
  email: string;
  password: string;
}

export interface IVendorSignInPayload {
  email: string;
  password: string;
}

export interface IVerifyInvitationLinkpayload {
  token: string;
  email: string;
}

export interface IVendorBulkApprove {
  vendorIds: string[];
  approvalRemark: string;
  categoryIds: string[];
  paymentTermsId: string;
}

export interface IVendorActionpayload {
  vendorId: string;
  status: "APPROVED" | "REJECTED";
  approvalRemark?: string;
  rejectionReason?: string;
  categoryIds?: string[];
  paymentTermsId?: string;
  stepsRejected?: {
    step: OnboardingSteps;
    rejectionReason: string;
  }[];
  // vendorCategory?: string;
  // paymentTerms?: string;
  // rejectionData?: {
  //   step: OnboardingSteps;
  //   rejectionReason: string;
  // }[];
}

export interface IProductDetails {
  productId?: string;
  productCode: string;
  productName: string;
  productNumber: string;
  annualVolumeQty: string;
  uom: string;
  productDeliveryDetails: string;
  genericName: string;
}

export interface ICreateAuctionPayload {
  requirementTitle: string;
  projectName: string;
  clientName: string;
  productData: IProductDetails[];
}

export interface IUpdateAuctionPayload {
  rfqEventId: string;
  requirementTitle: string;
  projectName: string;
  clientName: string;
  productData: IProductDetails[];
}

export interface IAddVendorsToAuctionPayload {
  rfqEventId: string;
  vendorIds: string[];
}

export interface IAddAuctionTimePayload {
  rfqEventId: string;
  startTime: string;
  endTime: string;
}

export interface IAddCollabaratorsPayload {
  rfqEventId: string;
  collaboratorIds: string[];
}

export interface IAddPublishAuctionPayload {
  rfqEventId: string;
  emailSubject: string;
  emailBody: string;
  vendorEmails: string[];
}

export interface IObservers {
  name: string;
  observerId: string;
  seeVendorName: boolean;
  seeVendorPrice: boolean;
}

export interface IAuctionInfo {
  infoType: string;
  itemHasFirstQuote: boolean;
  bidderCanBidAgainst: string;
  displayLeadingPriceToVendors: boolean;
  minBidDifference: number;
  chanceToMatchL1: boolean;
  showLeadingPriceToVenders: boolean;
}

export interface IItemHeaders {
  name: string;
  type: string;
  required: boolean;
  position: number;
}

export interface IIteamData {
  // [key: string]: string | number;
  ProductName: string;
  StartingPrice: number;
}

export interface IItems {
  data: Record<string, any>;
}

export interface IItemSheets {
  name: string;
  description: string;
  position: number;
  itemHeaders: IItemHeaders[];
  items: IItems[];
}

export interface IParticipants {
  name: string;
  status: string;
  vendorId: string;
  bidRecords: any[];
  response: string;
}

export interface IStepStructure {
  stepName: string;
  step: number;
  status: string;
}

export interface IStepApiResponse {
  id: string;
  stepName: string;
  step: number;
  auctionId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreatorsApiResponse {
  id: string;
  creatorId: string;
  auctionId: string;
}

export interface ICreateAuctionsPayload {
  name: string;
  startTime: string;
  steps: IStepStructure[];
  status: string;
  eventCode: string;
  templateCode: string;
  // eventCategory: string;
  eventCategory: IObservers[];
  businessDepartment: string;
  coCreators: {
    creatorId: string;
  }[];
  termsAndConditions: string;
  eventDocuments: any[];
  vendorDocuments: any[];
  observers: IObservers[];
  auctionInfo: IAuctionInfo;
  itemSheets: IItemSheets[];
  itemType: string;
  auctionBehavior: string;
  participants: IParticipants[];
  batchName: string;
  batchCode: string;
  leadingPrice: number;
  batchScheduleBehavior: string;
  batchStart: string;
  lineItemRunningTimeDays: number;
  lineItemRunningTimeHours: number;
  lineItemRunningTimeMinutes: number;
  autoExtension: boolean;
  extendTime: string;
}

export interface IItemResponse {
  auctionItem: any;
  id: string;
  itemsSheetId: string;
  data: Record<string, string | number | boolean>;
}

export interface IItemHeaderResponse {
  id: string;
  itemsSheetId: string;
  name: string;
  type: string;
  required: boolean;
  position: number;
}

export interface IItemsSheetResponse {
  id: string;
  auctionId: string;
  name: string;
  description: string;
  position: number;
  installationPrice?: boolean;
  isEditable?: boolean;
  itemHeaders: IItemHeaderResponse[];
  items: IItemResponse[];
}

export interface IAuction {
  BatchDocument: any;
  categories: any;
  businessDepartmentId: string;
  buyer: BuildBy;
  id: string;
  name: string | "";
  startTime: string | "";
  status: string;
  eventCode: string | "";
  templateCode: string;
  PurchaseOrder: any[];
  // eventCategory: string | "";
  eventCategory: IObserversApiResponse[];
  businessDepartment: string | "";
  termsAndConditions: string | "";
  itemType: string | "";
  auctionBehavior: string | "";
  batchName: string | "";
  batchCode: string | "";
  leadingPrice: string | "";
  batchScheduleBehavior: string | "";
  batchStart: string | "";
  lineItemRunningTimeDays: number | "";
  lineItemRunningTimeHours: number | "";
  lineItemRunningTimeMinutes: number | "";
  autoExtension: boolean;
  extendTime: string;
  createdAt: string;
  updatedAt: string;
  steps: IStepApiResponse[];
  coCreators: ICreatorsApiResponse[];
  eventDocuments: string[];
  vendorDocuments: string[];
  observers: IObserversApiResponse[];
  auctionInfo: IAuctionInfoApiResponse;
  itemsSheets: IItemsSheetResponse[];
  participants: IParticipantApiResponse[];
  winnerAnnounced: string;
}

export interface IParticipantApiResponse {
  id: string;
  name: string;
  rank: number | null;
  status: string;
  vendorId: string;
  auctionId: string;
  response: string;
  auctionResult: string;
  createdAt: string;
  updatedAt: string;
  bidRecords: any[];
  lastBidRecord: any;
  firstBidRecord: any;
  vendor: any | null;
}

export interface IObserversApiResponse {
  id: string;
  name: string;
  observerId: string;
  seeVendorName: boolean;
  seeVendorPrice: boolean;
  auctionId: string;
}

export interface IAuctionInfoApiResponse {
  infoType: string;
  id: string;
  auctionId: string;
  itemHasFirstQuote: boolean;
  bidderCanBidAgainst: string;
  displayLeadingPriceToVendors: boolean;
  minBidDifference: number;
  minBidDifferenceContractors: number | null;
  bidDifferenceType: string | "";
  mcdPrice: number | "";
  maxBidDifferenceEnabled: boolean | null;
  maxBidDifferencePrice: number | 0;
  chanceToMatchL1: boolean;
  showLeadingPriceToVenders: boolean;
  showLeadingPriceToTop3Venders: boolean | null;
  reservedBuyingSelling:
    | "INDICATIVE"
    | "STOP_FURTHER_BIDDING"
    | "NOT_APPLICABLE"
    | null;
  reserveBuyingSellingPrice: number | 0;
  preferentialTreatment:
    | "MULTIPLICATION"
    | "ADDITION"
    | "SUBTRACTION"
    | "NONE"
    | null;
  vendorComments: string | null;
  participationRankDisplay: boolean | null;
  bidderUploadAdditionalDocuments: boolean | null;
  singleBidEnabled: boolean | null;
  allowZeroItemBidPrice: boolean | null;
  enableBatchRelaunch: boolean | null;
  maskVendorCompanyNames: boolean | null;
  minimumBDPrice: number | null;
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
}

export interface IAuctionApiResponse {
  message: string;
  data: IAuction[];
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface IAuctionGetByIdApiResponse {
  message: string;
  auction: IAuction;
}

export interface ICreateTemplatePayload {
  name: string;
  HasFirstQuote: boolean;
  canBidAgainst: string;
  displayleadingprice: boolean;
  // bidDifference: string;
  hasMaxBidDiff: boolean;
  maxBidDiffPrice: number;
  // canMatchLeadingVendorsPrice: boolean;
  hasReservedBuyingOrSelling: string;
  // preferentialTreatment: string;
  // CanComment: string;
  canDisplayParticipationRank: string;
  canUploadDocument: boolean;
  isSingleBid: boolean;
  canBidPriceZero: boolean;
  // enableBatchRelaunch: boolean;
  isVendorCompanyNameMasked: boolean;
  isVendorBidPriceMasked: boolean;
  // mcdPrice: number;
}

export interface IAuctionTemplate {
  id: string;
  buyerId: string;
  name: string;
  HasFirstQuote: string;
  canBidAgainst: string;
  displayleadingprice: boolean;
  bidDifference: string;
  hasMaxBidDiff: boolean;
  maxBidDiffPrice: number;
  canMatchLeadingVendorsPrice: boolean;
  hasReservedBuyingOrSelling: string;
  preferentialTreatment: string;
  CanComment: string;
  canDisplayParticipationRank: string;
  canUploadDocument: boolean;
  isSingleBid: boolean;
  canBidPriceZero: boolean;
  enableBatchRelaunch: boolean;
  isVendorCompanyNameMasked: boolean;
  isVendorBidPriceMasked: boolean;
  // mcdPrice: number;
  minimumBDPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface IAuctionTemplateResponse {
  message: string;
  templates: IAuctionTemplate[];
}

export interface IAuctionCategoriesResponse {
  message: string;
  data: IAuctionCategoriesReponse[];
}

export interface IAuctionCategoriesReponse {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMasterCategoriesResponse {
  message: string;
  data: IMasterCategoriesReponse[];
}

export interface IMasterCategoriesReponse {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMasterPaymentTermsResponse {
  message: string;
  data: IMasterPaymentTermsReponse[];
}

export interface IMasterPaymentTermsReponse {
  id: string;
  code: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  status: boolean;
  approvedById: any[];
  deletedAt: string | null;
}

export interface ICoCreatorsListApiResponse {
  message: string;
  data: iCoCreatorsList[];
}

export interface iCoCreatorsList {
  id: string;
  email: string;
  password: string;
  name: string;
  companyName: string;
  role: string;
  userType: string;
  createdAt: string;
  updatedAt: string;
}


export interface IObserverResponseApi {
  message: string;
  data: IObserversResponse[];
}

export interface IObserversResponse {
  id: string;
  name: string;
  observerId: string;
  seeVendorName: string;
  seeVendorPrice: string;
  auctionId: string;
}

export type OnboardingSteps =
  | "TAX_INFO"
  | "COMPANY_INFO"
  | "BANK_INFO"
  | "LICENSE_INFO"
  | "DOCUMENT_INFO"
  | "COMPLETED";

export interface ICreateRfqEventPayload {
  title: string;
  department: string;
  itemType: string;
  items: { itemCode: string; annualVolumeQuantity: number | string }[];
}

export interface IUpdateRfqEventPayload {
  rfqEventId: string;
  title: string;
  department: string;
  itemType: string;
  items: { itemCode: string; annualVolumeQuantity: number | string }[];
}

export interface IAddRfqTimePayload {
  rfqEventId: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  paymentTerms: string;
  rfqAttachments: any[];
  preferredVendorsByPlant: {
    plantCode: string;
    distributorName: string;
  }[];
}

export interface IAddRfqReviseOfferPayload {
  rfqEventId: string;
  vendorId: string;
  revisedItemPrices: {
    rfqItemId: string;
    revisedCostPrice: number | unknown;
    remarks?: string;
    vendorId?: string;
  }[];
}
export interface IAddRfqCollectiveReviseOfferPayload {

  vendorOffers :{
    vendorId: string;
    rfqEventId: string;
    revisedItemPrices: { rfqItemId: string;
      revisedCostPrice: number;
      revisionRemarks?: string;}[];
  }[]
}

export interface IApproveRfqReviseOfferPayload {
  rfqEventId: string;
  vendorId: string;
  revisedItemPrices: { rfqItemId: string; status: string }[];
}

export interface IAddRfqToAuctionPayload {
  rfqEventId: string;
  vendorIds: { collaboratorId: string; role: string }[];
}

export interface IAddCollabaratorsToRfqPayload {
  rfqEventId: string;
  collaborators: { collaboratorId: string; role: string }[];
}


export interface CompanyCode{
  _count: any;
  updatedAt: any;
  city: any;
  state: any;
  country: any;
  registrationNumber: string;
  gst: string;
  name: string;
  status: string;
  id:string;
  legalName: string;
  GSTIN:string;
  PAN:string;
  REGNO:string;
  pincode:string;
  address:string;
  masterCountryId :string;
  masterStateId:string;
 masterCityId :any;
  masterCountry :any;
 masterState:any;
masterCity :any;
  code:string;
  description:string;
  createdAt:string;
  createdBy: BuildBy;
  deletedAt:string;
  approvedBy:BuildBy;
}


export interface CompanyCodeSingleResponse{
  message:string;
  data:CompanyCode;
}


export interface CompanyCodeResponse {
  message: string;
  data: CompanyCode[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}
export interface CompanyCodeIdRes{
  message:string;
  data:CompanyCodeResponse;
}
export interface CompanyCodepayloadData {
  name: string;
  code:string;
  GSTIN:string;
  pincode:string;
  address:string;
  PAN:string;
  REGNO:string;
  countryId:string;
  stateId:string;
  cityId:string;
}




export interface Roles{
  updatedAt: any;
  id: string;
title:string;
RolePermission:any;
department:any;
createdAt:any;
approvedBy:BuildBy;
createdBy:BuildBy;
discription:string;
status:string;
}


export interface RolesSingleResponse{
  title:string;
  department:any;
  permission:string;
  data:Roles;
}

export interface RolesListResponse{
  message: string;
  data: roleResponse[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}

export interface roleResponse {
  name: any;
  permission: any;
  departmentid: any;
  RolePermission: any;
  id:string;
      department: any;
  
  deletedAt?: string;
  title:string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: BuildBy;
  approvedBy: BuildBy;
}
export interface RolesIdRes{
  message:string;
  data:roleResponse;
}


export interface IncoTerms{
  updatedAt: any;
    status: any;
    createdAt: any;
  code: string;
  id: string;
name:string;
type:any;
description:string;
createdBy:any;
approvedBy:any;
deletedAt:any;

}


export interface IncoTermsSingleResponse{
  name:string;
  type:any;
  description:string;
  data:IncoTerms;
}

export interface IncoTermsListResponse{
  message: string;
  data: incoTermsResponse[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}

export interface incoTermsResponse {
  data: any;
  name:string;
  type:any;
  description:string;
  id:string;
  status: boolean;
  deletedAt?: string;
  totalRecords: number;
  totalPages: number;
  currentPage: number;

}
export interface incoTermsIdRes{
  message:string;
  data:incoTermsResponse;
}

export interface IncoTermspayloadData {
  code:string;
      description:string;
 
}








export interface CategoriesListResponse {
  message: string;
  data: categoryResponse[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}


export interface CategoryIdRes{
  message:string;
  data:categoryResponse;

}

export interface categoryResponse {
  _count: any;
  Materialgroups: any;
  id: string;
  name: string;
  code: string;
  createdById?: string | null;
  approvedById?: string | null;
  description: string;
  status: boolean;
  catMaterialGroups:string;
  masterMaterialGroupId?: any;
  masterManuFacturerId?: string | null;
  masterMaterialGroup:any,
  masterGenericId?: string | null;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  MasterGeneric?: Generic | null;
  MasterManuFacturer?: MasterManuFacturerMatGrpRes[];
  MasterMaterialGroup?: MasterMaterialGroupRes[]; 
  createdBy?: BuildBy;
  approvedBy?: BuildBy;
}





export interface DepartmentsListResponse {
  message: string;
  data: departmentResponse[];

}


export interface DepartmentIdRes{
  message:string;
  data:departmentResponse;

}

export interface departmentResponse {
  id: string;
  name:string; 
}
export interface DepartmentCreateData {
  name: string;
}




export interface PermissionsListResponse {
  message: string;
  data: permissionsResponse[];

}


export interface PermissionsIdRes{
  message:string;
  data:permissionsResponse;

}

export interface permissionsResponse {
  id: string;
  name:string; 
}
export interface PermissionsCreateData {
  name: string;
}

export interface MasterMaterialGroupRes {
  id: string;
  name: string;
  createdById: string;
  approvedById: string;
  description: string;
  status: any;
  masterManuFacturerId: string;
  masterGenericId: string;
  masterCategoryId: string;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryCreateData {
  name: string;
  description: string;
  materialGroupId: any;

}

export interface BuildBy {
  id: string;
  email: string;
  password: string;
  name: any;
  companyName: string;
  headId:string;
  role: string;
  userType: string;
  createdAt: string;
  updatedAt: string;
}
export interface MaterialGroup {
  message: string;
  data: MaterialGroupRes[];
  totalRecords:number;
  totalPages:number;
  currentPage:number
}

export interface MaterialGroupRes {
  code: string;
  id: string;
  name: string;
  createdById: string;
  approvedById: string;
  description: string;
  status: any;
  masterManuFacturerId: string;
  masterGenericId: string;
  masterCategoryId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: BuildBy | null;
  approvedBy?: BuildBy | null;
  masterCategories: mastercategoryMatGrpRes;
  MasterManuFacturer: MasterManuFacturerMatGrpRes;
}
export interface mastercategoryMatGrpRes {
  id: string;
  name: string;
  code: string;
  createdById: string | null;
  approvedById: string | null;
  description: string;
  status: boolean;
  masterMaterialGroupId: string | null;
  masterManuFacturerId: string | null;
  masterGenericId: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MasterManuFacturerMatGrpRes {
  id: string;
  name: string;
  code: string;
  createdById?: string | null;
  approvedById?: string | null;
  description?: string | null;
  categoriesId: any;
  materialGroupId: string[];
  mobile: string;
  email: string;
  cityId: string;
  stateId: string;
  countryId: string;
  status: string;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}




export interface MasterManufacturerByIdRes{
  message:string;
  data : Manufacturer;
}

export interface CategoryManufacturerRes{
  id:string;
  name:string;
  code:string;
  createdById?:string;
  approvedById?:string;
  description:string;
  status:boolean;
  masterMaterialGroupId?:string;
  masterManuFacturerId?:string;
  masterGenericId:string;
  deletedAt?:string;
  createdAt?:string;
  updatedAt?:string;
}

export interface buyerRole {
  id:string;
  title:string;
  roleId:string;
  department:[];
}

export interface User{
  Businessdepartments: any;
  address: string;
  employeeId: any;
  permission: any;
  department: any;
  approvedBy: any;
  id: any;
  email: string;
  avatar: string;
  bio: string;
  mobile: string;
  name: string;
  prAutoStatus: boolean;
  companyName: string;
  userType: string;
  createdBy: any;
  createdAt: string;
  updatedAt: string;
  roles: buyerRole[];
  BuyerRoleAssignment: buyerRole[];
  BuyersPlant: {
    id: string;
    buyerId: string;
    plantId: string;
    plant: {
      id: string;
      name: string;
      code: string;
    };
  }[];
  BuyerBusinessDepartment: {
    id: string;
    buyerId: string;
    businessDepartmentId: string;
    businessDepartment: {
      id: string;
      name: string;
      code: string;
      headId: string;
      createdById: string;
      approvedById: string;
      description: string;
      status: boolean;
      deletedAt: string | null;
      createdAt: string;
      updatedAt: string;
    };
  }[];
  BuyerPermissionAssignment: {
    id: string;
    buyerId: string;
    permissionId: string;
    createdAt: string;
    updatedAt: string;
    permission: {
      id: string;
      name: string;
      url: string;
      parent: string | null;
      createdById: string | null;
      buyerId: string | null;
      deletedAt: string | null;
      createdAt: string;
      updatedAt: string;
    };
  }[];
  head: any;
  headId: string;
  deletedAt?: string;
}

export interface BuyerSingleResponse{
  message:string;
  data:User;
}
export interface UserResponse{
  message:string;
  data:User[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}
export interface UserSingleResponse{
  message:string;
  data:User;
}
export interface UserpayloadData {
  name: string;
  email: string;
  departmentid:string[];
  permissionIds:string[];
  plantIds:string[];
  password: string;
  roleIds: string[];
  mobile?: string;
  address?: string;
  bio?: string;
  avatar?: string;
  headId?: string;
  companyName?: string;
  employeeId?: string;
  createdById?: string;
}
export interface Log{
  id: string;
  ip:string;
  path:string;
  payload:any;
  controllerName:string;
  modelName:string;
  createdAt:string;
  buyer:any;
  vendor:any;
  handlerFunction:string;
  bodyResponce:any;
}

export interface LogResponse{
  message:string;
  data:Log[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}
export interface LogSingleResponse{
  message:string;
  data:Log;
}
export interface LogpayloadData {
  ip:string;
  path:string;
  payload:string;
  controllerName:string;
  modelName:string;
  buyer:string;
  vendor:string;
  handlerFunction:string;
  bodyResponce:string;
 
}

export interface PurchaseOrganisations{
  _count: any;
  companyName: string;
  updatedAt: any;
  code: string;
  status: string;
  id: string;
  name: string;
  description:string;
  companyCode:any;
  createdAt:string;
  createdBy: BuildBy;
  approvedBy: BuildBy;
  deletedAt:string;
 
}

export interface purchaseOrganisationsResponse{
  message:string;
  data:PurchaseOrganisations[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}
export interface purchaseOrganisationsSingleResponse{
  message:string;
  data:PurchaseOrganisations;
}
export interface purchaseOrganisationspayloadData {
  name:string;
  code:string;
  companyCodeId:any;
  description:string;
}

export interface GeneralLedgerAccount{
  _count: any;
  updatedAt: any;
  code: any;
  status: string;
  id: string;
  name: string;
  type:string;
  description:string;
  companyCodeId:any;
  companyCode:CompanyCode;
  createdAt:any;
  createdBy: BuildBy;
  approvedBy: BuildBy;
  deletedAt:string;
 
}

export interface GeneralLedgerAccountResponse{
  type: string;
  companyCodeId: any;
  description: string;
  name: string;
  message:string;
  data:GeneralLedgerAccount[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}
export interface GeneralLedgerAccountSingleResponse{
  message:string;
  data:GeneralLedgerAccount;
}
export interface GeneralLedgerAccountpayloadData {
  code:string;
  companyCodeId:any;
  description:string;
}



export interface Permission{
  id: string;
  name: string;
  createdBy: BuildBy;
  deletedAt?: string;
  createdAt: string;

}

export interface PermissionResponse{
  message:string;
  data:Permission[];
  totalRecords:number;
  totalPages:number;
  currentPage:number
}
export interface PermissionSingleResponse{
  message:string;
  data:Permission;
}
export interface PermissionpayloadData {
 name:string;
 createdBy: BuildBy;
 createdAt: BuildBy;
 
}



export interface City{
  name: string;
  createdAt: string;
  pinCode:string;

}

export interface CityResponse{
  message:string;
  data:City[];
  totalRecords:number;
  totalPages:number;
  currentPage:number
}
export interface CitySingleResponse{
  message:string;
  data:City;
}
export interface CitypayloadData {
 name:string;
 createdAt: BuildBy;
 pinCode:string;

}


export interface Plant{
  updatedAt: any;
  _count: any;
  status: any;
  companyCodeId: string;
  companyCode:any;
  id: string;
  name: string;
  description: string;
  code: string;
  pinCode:string;
  address:string;
  deletedAt?: string;
  createdAt:string;
  createdBy: BuildBy;
  approvedBy: BuildBy;
  masterCountryId:string;
  masterStateId:string;
  masterCityId:string;
  masterCountry:any;
  masterState:any;
  masterCity:any;

}

export interface PlantResponse{
  message:string;
  data:Plant[];
  totalRecords:number;
  totalPages:number;
  currentPage:number
}
export interface PlantSingleResponse{
  message:string;
  data:Plant;
}
export interface PlantpayloadData {
  name: string;
  code: string;
  description:string;
  pinCode:string;
  address:string;
  masterCountryId:any;
  masterStateId:any;
  masterCityId:any;
companyCodeId:any;

}


export interface TermsAndCondition{
  updatedAt: any;
  status: any;
  description: string;
  approvedBy: BuildBy;
  id: string;
  name: string;
  type:string;
  clause?: string;
  createdAt:string;
  createdBy: BuildBy;
  deletedAt?: string;
}

export interface TermsAndConditionResponse{
  message:string;
  data:TermsAndCondition[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;

}
export interface TermsAndConditionSingleResponse{
  message:string;
  data:TermsAndCondition;
}
export interface TermsAndConditionpayloadData {
  name: string;
  description: string;
  clause?: string;
}


export interface State{
  id: any;
  name: string;
  createdAt: string;
  deletedAt?: string;
  stateCode:string;

}

export interface StateResponse{
  message:string;
  data:State[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}
export interface StateSingleResponse{
  message:string;
  data:State;
}
export interface StatepayloadData {
 name:string;
 createdAt: BuildBy;
 stateCode:string;

}
export interface Transaction{
  budget: any;
  updatedAt: any;
  status: string;
  id: string;
  glAccount: any;
  RFQID:string;
  AuctionId:string;
  creditAmount:string;
  debitAmount:string;
  effectiveAmmount:string;
  createdAt:string;

}

export interface TransactionResponse{
  message:string;
  data:Transaction[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}
export interface TransactionSingleResponse{
  message:string;
  data:Transaction;
}
export interface TransactionpayloadData {
  status: string;
  id: string;
  GLAcountid: string;
  RFQID:string;
  AuctionId:string;
  creditAmount:string;
  debitAmount:string;
  effectiveAmmount:string;
  createdAt:string;

}

export interface TransferpayloadData {
sourceId:string;
destinationId:string;
budgetAmount:number;

}
export interface AssignpayloadData {
   departmentId:string;
    financialYearId:string;
    generalLedgerAccountId:string;
    budgetAmount:number;

}


export interface Country{
  id: any;
  name: string;
  createdAt: string;
  countryCode:string;
  deletedAt?: string;

}

export interface CountryResponse{
  id:string;
  message:string;
  data:Country[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}
export interface CountrySingleResponse{
  message:string;
  data:Country;
}
export interface Item{
    name: string;
    materialGroup: any;
    id: string,
    itemCode: string,
    itemTag: string,
    Brand:any,
    MasterGeneric:any,
    materialId: string[],
    brandId: any,
    genericId: string,
    mfgCodeId: string,
    categoryId: string,
    materialTypeId: any,
    unitOfMeasure: string,
    HSNCode: string,
    packSize: string,
    materialGroupId:string;
    mrp: number,
    materialType:any;
    previousCostPrice: string,
    previousMRP: string,
    createdById: string,
    approvedById: string,
    description: string,
    status: boolean,
    deletedAt: string,
    createdAt: string,
    updatedAt: string,
    masterCategoryId: string,
    masterManuFacturerId: string,
    masterBrandId: any,
    masterGenericId: string,
    masterMaterialGroupId: string,
    createdBy: BuildBy,
    approvedBy: BuildBy,
    MasterCategory: any,
    masterManuFacturer: any,
    MasterBrand: any,
    masterGeneric: any,
    masterMaterialType: any,
    material: any,

}

export interface ItemResponse{
  message:string;
  data:Item[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}

export interface ItemSingleResponse{
  message:string;
  data:Item;
}
export interface ItempayloadData {
  // categoriesId:string[];
  itemCode:string;
  brandId:string;
  genericId:string;
    masterMaterialGroupId:string,
     categoryId:string,
  HSNCode:any;
  ITEM_TAG:string
  unitOfMeasure:string;
  description:string;
  // materialGroupId:string[];
  materialTypeId:string;
}
export interface NotificationContent{
  id:string;
code:string;
 name: string;
emailTitle:string;
socketTitle:string;
whatsappTitle:string;
  socketBody: string;
  actionUrl: string;
  actionText: string;
  smsBody: string;
  whatsappBody: string;
  emailBody: string;
  description: string;
  emailSubject: string;
  createdAt:string;
  createdBy: string;
}

export interface NotificationContentResponse{
  message:string;
  data:NotificationContent[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}

export interface NotificationContentSingleResponse{
  message:string;
  data:NotificationContent;

}
export interface NotificationContentpayloadData{
code:string;
 name: string;
emailTitle:string;
socketTitle:string;
whatsappTitle:string;
emailSubject:string;
description:string;
emailBody:string;
whatsappBody:string;
smsBody:string;
actionText:string;
socketBody:string;

  
}












export interface PaymentTerms{
  updatedAt: any;
  status: boolean;
  createdAt: any;
  approvedById: any;
  createdById: any;
  noOfDays: any;
  id: string;
  description: string;
  code:string;
  deletedAt?: string;
}

export interface PaymentTermsResponse{
  message:string;
  data:PaymentTerms[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}

export interface PaymentTermsSingleResponse{
  message:string;
  data:PaymentTerms;
}
export interface PaymentTermspayloadData {
  code:string;
  noOfDays:any;
 description:string;

}
export interface Faq{
  articles: any;
 
  id: string;
  name: string;
  slug:string;
}

export interface FaqResponse{
  meta: any;
  message:string;
  data:Faq[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}

export interface FaqSingleResponse{
  message:string;
  data:Faq;
}

export interface ContractpayloadData {
  price: string;
  createdAt:string;
  createdBy: BuildBy;

}




export interface MaterialType{
  _count: any;
  updatedAt: any;
  totalItems: number;
  status: string;
  approvedBy: any;
  code: any;
  id:any;
  description: string;
  name: string;
  createdAt:string;
  createdBy: BuildBy;
  deletedAt?: string;

}

export interface MaterialTypeResponse{
  message:string;
  data:MaterialType[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}
export interface MaterialTypeSingleResponse{
  message:string;
  data:MaterialType;
}
export interface MaterialTypepayloadData {
  name: string;
  description:string;
  

}


export interface RolespayloadData{
title:string;
departmentid:string;
permissionIds:string[];

}
export interface GenericResponse{
  message:string;
  data:Generic[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}

export interface FaqCategory{
  id:any;
  name:string;
  slug:string;
  children:any;
}

export interface FaqCategoryResponse{
  message:string;
  data:FaqCategory;
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}

export interface Faqbox{
  data: any;
  id:any;
title:string;
  slug:string;
  content:string;
  categoryId:any;
  subCategoryId:any;
  createdAt:string;
}

export interface FaqboxResponse{

  message:string;
  data:Faqbox;
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}

export interface GenericSingleResponse{
  message:string;
  data:Generic;
}

export interface Generic{
  _count: any;
  masterMaterialGroup: any;
  cateroies: any;
  id: string;
  name:string;
  code:string;
  createdById?:string;
  approvedById?:string;
  description?:string;
  categoriesId?:string[];
  materialGroupId:any;
  status:boolean;
  masterGenericId:string;
  genericCategories:any;
  masterMaterialGroupId:any;
  genericMaterialGroups:any;
  genericBrands: any;
  createdBy?: BuildBy;
  approvedBy?:BuildBy;
  deletedAt?:string;
  createdAt:string;
  updatedAt:string;
}



export interface ManufacturerRes{
  message:string;
  data:Manufacturer[];
    totalRecords:number;
  currentPage:number;
  totalPages:number;
}
export interface ManufacturerSingleResponse{
  message:string;
  data:Manufacturer;
}
export interface Manufacturer {
  _count: any;
  manufacturerCategory:string;
  manufacturerMaterial:string;
  address: string;
  manufacturerMaterialGroups:string;
  pincode: string;
  id: string;
  name: string;
  code: string;
  createdById?: string;
  approvedById?: string;
  description?: string;
  categoriesId?:string[];
  mobile: string;
  email: string;
  MaterialGroup:any;
  cityId: string;
  stateId: string;
  countryId: string;
  status: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;

  Category: any;
  materialGroupId:string[];
  createdBy: BuildBy;
  approvedBy: BuildBy;
  categories: CategoryManufacturerRes[];
  MasterMaterialGroup: MaterialGroupRes[];
  country: CountryRes;
  state: StateRes;
  category: categoryResponse;
  city: City;
}

export interface GenericCategories {
  id: string;
  masterGenericId: string;
  masterCategoryId: string;
  masterCategory?: categoryResponse[];
}

export interface IGenericBrands {
  id: string;
  masterGenericId: string;
  masterBrandId: string;
  masterBrand: Brand;
}

export interface GenericMaterialgrp {
  id: string;
  masterGenericId: string;
  masterMaterialGroupId: any;
  masterMaterialGroup: MaterialGroupRes[];
}

export interface ManufacturerRes {
  message: string;
  data: Manufacturer[];
  totalRecords:number;
  totalPages:number;
  currentPage:number;
}


export interface MaterialGroupByIdRes {
  message: string;
  data: MaterialGroupById;
}

export interface MaterialGroupById {
  _count: any;
  GenericMaterialGroup: number;
  totalItems: number;
  code: string;
  id: string;
  name: string;
  createdBy?: any;
  approvedBy?: any;
  description: string;
  status: boolean;
  masterManuFacturerId: string;
  masterGenericId: string;
  masterCategoryId: string;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;
}
export interface CountryRes {
  id: string;
  name: string;
  countryCode: string;
  deletedAt?: BuildBy | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StateRes {
  id: string;
  name: string;
  stateCode: string;
  countryId: string;
  
  masterCountryId?: string;
  deletedAt?: BuildBy;
  createdAt: string;
  updatedAt: string;
}
export interface masterCard {
  subtitle: string | undefined;
  colorClass: string;
  title:string;
  count:number;
  path:string;
  icon:string;
}
export interface City {
  id: string;
  name: string;
  pinCode: string;
  countryId: string;
  stateId: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}


export interface masterCountResponce {
  message: string;
  data: masterCard[];
}

export interface cityResData {
  message: string;
  data: City[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}

export interface stateResData {
  message: string;
  data: StateRes[];
}

export interface countryResData {
  message: string;
  data: CountryRes[];
}

export interface ManufacturerpayloadData {
  name: string;
  description: string;
  categoriesId: string[];
  materialGroupId: string[];
  mobile: string;
  email: string;
  pincode:string;
  address:string;
  cityId: string;
  stateId: string;
  countryId: string;
}


export interface GenericpayloadData{
  name:string;
  // code:string;
  description:string;
  categoriesId:string[];
  materialGroupId: any;
}

export interface profile {
 name:string;
  avatar:string;
  bio:string;
email:string;
  mobile:string;
  password: string;
  cpassword: string;
  address:string;
}

export interface ProfilepayloadData{
  name:string;
  avatar:string;
  bio:string;
email:string;
  mobile:string;
  password: string;
  cpassword: string;
  address:string;
}
export interface MaterialGroupPayloadData{
  name : string;
  description:string;
}

export interface BrandListRes {
  message: string;
  data: Brand[];
  totalRecords:number;
  totalPages: number;
  currentPage:number;
}

export interface BrandByIdRes {
  message: string;
  data: Brand;
}
export interface Brand {
  _count: any;
  masterManufacturereId: string;
  id: string;
  name: string;
  manuFacturer:any;
  manuFacturerId:any;
  MasterGeneric:any;
  createdById?: string;
  approvedById?: string;
  description: string;
  status: boolean;
  masterGenericId: string;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: BuildBy;
  approvedBy?: BuildBy;
}

export interface CretaeBrandFormat {
  name: string;
  description: string;
  manuFacturerId:string;
  masterGenericId: string;
}

export interface BusinessDepartmentRes {
  message: string;
  data: BusinessDepartment[];
  totalRecords:number;
  totalPages:number;
  currentPage:number;
}

export interface BusinessDeptByIdRes {
  message: string;
  data: BusinessDepartment;
}

export interface BusinessDepartment {
  _count: any;
  headId: any;
  code: any;
  id: string;
  name: string;
  createdById?: string;
  companyCodeId:any;
  companyCode:any;
  approvedById?: string;
  description: string;
  // requeredForAproval: boolean;
   aprovalForAuction:boolean;
   aprovalForARC: boolean,
  aprovalForInvoice:boolean,
  aprovalForPurchaseOrder: boolean,
  aprovalForPurchaseRequest: boolean,
  requiredForApproval: boolean;
  status: boolean;
  head:any;
  deletedAt?: string;
  createdAt: string;
  aprovalForVendor:boolean;
  updatedAt?: string;
  createdBy?: BuildBy;
  approvedBy?: BuildBy;
}

export interface BusinessDepartmentCreateFormat {
  name: string;
  code:string;
  headId:string;
  description: string;
  companyCodeId:string;
   aprovalForVendor:boolean;
  aprovalForAuction:boolean;
   aprovalForARC: boolean,
  aprovalForInvoice:boolean,
  aprovalForPurchaseOrder: boolean,
  aprovalForPurchaseRequest: boolean,
  requiredForApproval: boolean;
}
export interface pagination {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface AuctionChat {
  auctionId: string;
  buyerId: number;
  createdAt: string;
  id: number;
  message: string;
  senderName: string;
  vendorId: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
}

export interface IAuctionChatGetByIdApiResponse {
  message: string;
  pagination: pagination;
  data: AuctionChat[];
}

export interface financial{
  financialYear: any;
   id: string;
name:string;
    startDate:string;
 endDate:string;
 createdAt:string;
 status:string;
 createdById:string;
 approvedById:string;
   deletedAt?: string;
 
 
}

export interface financialResponse{
  message:string;
  data:financial[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}
export interface financialSingleResponse{
  financialYear: any;
  message:string;
  data:financial;
}
export interface financialpayloadData {

name:string;
startDate:Date;
endDate:Date;

}
            

export interface Budget{
  id: any;
 finincialYearId:any;
 generalLedgerAccount:string;
  budgetAmount: string;
  departmentId: string,
  createdById: string,
  createdAt: string,
  department:string;
  finincialYear:string;
  totalAmount: any,
  totalSpend: any,
  totalRemaining:any;

  GLAcountid:string;
budgetId:string;
RFQID:string;
AuctionId:string;
creditAmount:string;
debitAmount:string;
effectiveAmmount:string;
status:string;
reatedById:string;
budget:string;
}

export interface BudgetResponse{
  message:string;
  data:Budget[];
  totalRecords:number;
  currentPage:number;
  totalPages:number;
}
export interface BudgetSingleResponse{
  message:string;
  data:Budget;
}
