const ENDPOINTS = {
  vendorSignUp: '/vendor/auth/register',
  vendorSignIn: '/vendor/auth/login',
  vendorVerifyInvitationLink: '/vendor/verify_invite_link',
  vendorAccountDetails: '/vendor/accountDetails',
  vendorDetails: '/vendor/getVendorDetails',
  inviteDistributor: '/buyer/inviteDistributor',
  inviteBulkDistributors: '/buyer/inviteBulkDistributors',
  getDistributorsList: '/vendor/distributors',
  vendorContractStatusUpdate: '/contracts/contract-status-update',
  getBuyerProfile: '/buyer/getProfile',
  buyerSignIn: '/buyer/auth/login',
  // BUYER -----------------------------------------------------------
  rfqVendorsList: '/admin/vendor/users',
  inviteVendor: '/buyer/inviteVendor',
  reInviteVendor: '/buyer/reInviteVendor',
  editSupplier:'/buyer/vendors/updateVendorCategories',
  inviteBulkVendor: '/buyer/inviteBulkVendor',
  venodrList: '/buyer/vendorsList',
  approvalsList: '/buyer/approvalList',
  vendorById: '/buyer/getVendorDetails',
  vendorAction: '/buyer/vendors/approveOrReject',
  vendorDelete: '/buyer/deleteVendor',
  vendorRestore: '/buyer/restoreVendor',
  buyersList: '/buyer/buyerList',
  buyersListByDepartmentId: '/buyer/buyersByDepartmentId',
  buyerById: '/buyer',
  vendorBulkApprove: '/buyer/vendors/bulkApprove',

  // ARC Report -------------------------------------------------------
  createArcReport: '/rfqEvent/create-arcReport',
  createCollectiveArcReport: '/rfqEvent/create-collective-arcReport',
  arcReportList: '/rfqEvent/get-arcReports',
  arcReportDetails: '/rfqEvent/get-arcReport-details',
  approveArcReport: '/rfqEvent/approve-arcReport',




  // RFQ event -------------------------------------------------------
  createRfqEvent: '/rfqEvent/createRfqEvent',
  updateRfqEvent: '/rfqEvent/UpdateRfqEvent',
  rfqEventbyId: '/rfqEvent/rfqEventDetail',
  rfqEventItems:'/rfqEvent/rfqEventItems',
  rfqEventOffers: '/rfqEvent/rfqEventOffers',
  rfqEventreviseOffer: '/rfqEvent/reviseOffer',
  rfqEventcollectivereviseOffer: '/rfqEvent/collectivereviseOffer',
  rfqStatusOffer: '/rfqEvent/approve-revise-offer',
  deleteRfqEvent: '/rfqEvent/deleteRfqEvent',
  cloneRfqEvent: '/rfqEvent/cloneRfqEvent',

  vendorOffer: '/rfqEvent/vendorOffer',
  addVendorToRfqEvent: '/rfqEvent/addVendors',
  removeVendorFromRfqEvent: '/rfqEvent/removeVendors',
  scheduleRfqEvent: '/rfqEvent/addTechnicalSpecs',
  extendRfqEventEndDate: '/rfqEvent/extendEndDate',
  addCollabarators: '/rfqEvent/addCollaborators',
  rfqEventList: '/rfqEvent/rfqEventList',
  getTopVendorOffers: '/rfqEvent/getTopVendorOffers',
  myrfqEventList: '/rfqEvent/vendor/getRfqEventList',
  publishRfqEvent: '/rfqEvent/publishRfqEvent',
  exportRfqEvent: '/rfqEvent/export-rfq-events',
  InvitedBy:'/auction/cocreators',
  deleteRfqEventItem: '/rfqEvent/deleteRfqEventItem',
// Order
createPurchaseRequest: '/pr/createPR',
getPurchaseRequest: '/pr/getPRDetails',
updatePurchaseRequest: '/pr/updatePR',
getPurchaseRequestList: '/pr/getPRList',
approvePurchaseRequest: '/pr/approvePR',
clonePurchaseRequest: '/pr/clonePR',
deletePurchaseRequest: '/pr/deletePR',


createPurchaseOrder: '/po/createPR',
getPurchaseOrder: '/po/getPODetails',
updatePurchaseOrder: '/po/updatePO',
updateAuctionPurchaseOrder: '/po/updateAuctionPO',
getPurchaseOrderList: '/po/getPOList',
getPurchaseOrderChangeLogs: '/po/getChangeLogs',
approvePurchaseOrder: '/po/approvePR',
createFromWithdrawnPO: '/po/createFromWithdrawn',
createManualPO: '/po/createManualPO',
createMultiplePOsFromPRs: '/po/createMultiplePOsFromPRs',
clonePurchaseOrder: '/po/clonePO',
deletePurchaseOrder: '/po/deletePO',

//asn
getAdvanceSimpmentNoteList: '/asn/getASNList',
getAdvanceSimpmentNoteDetails: '/asn/getASNDetails',


// grn
getGRNList: '/grn/getGRNList',
getGRNDetails: '/grn/getGRNDetails',
createGeneralReceiptNote: '/grn/createGRN',
updateGeneralReceiptNote: '/grn/updateGRN',

createInvoice:'/grn/createInvoice',
getInvoiceList:'/invoice/getInvoiceList',  
getraBillsList:'/invoice/getAllRaBills',
getVendorInvoiceDetails:'/invoice/getVendorInvoiceDetails',
approveInvoice:'/invoice/approveInvoice',
approveRaBills:'/invoice/approveRaBills',
getCreditNotes:'/invoice/getCreditNotes',
createGRNFromInvoice:'/invoice/createGRNFromInvoice',
uploadApprovalDocuments:'/invoice/upload-approval-documents',

  //Master
  master:{
    categories:'/master/categories',
    paymentTerms:'/master/paymentTerms'
  },

  // ITEM Master
  productCategories: '/itemMaster/getproductCategories',
  masterCategories: '/master/categories',
  productsList: '/master/items',
  plantsList: '/master/plants',
  businessDepartment:'master/businessDepartment',

  // VENDOR ONBOARDING
  vendorOnboarding: {
    addTaxInfo: '/vendor/taxDetails',
    addCompanyInfo: '/vendor/companyDetails',
    addBankInfo: '/vendor/bankDetails',
    addLicenseInfo: '/vendor/licenseDetails',
    addDocumentInfo: '/vendor/documentDetails',
    submitVendorDetails: '/vendor/submitVendorDetails',
    completeOnboarding: '/vendor/completeOnboarding',
  },

  //Auction 
  auction:{
    details : '/auction',
    list:'/auction',
    delete : '/auction',
    exportAuctionList:'/export-auctions',
    createAuctionApi:'/auction',
    templateApi:'/auction/template',
    headerTemplateApi:'/auction/header-template',
    categoriesApi : '/auction/categories',
    businessDepartmentApi :'/master/businessDepartment',
    // coCreatorsList :'/auction/cocreators',
    observersList :'/auction/observers',
    base : '/auction',
    createRABill : '/invoice/createRaBill',
    extendPo : '/po/extendPO',
    comparedBidsexport : '/auction/all-participant/excel',
  },

  //Categories 
  category : {
    categoriesList : '/master/categories',
  },
  department : {
    departmentsList : '/master/departments',
  },
  permissions:{
    permissionsList: '/master/permissions',
  },
  cities:{
    citiesList: '/master/cities',
  },
 contracts:{
    contractsList: '/master/contracts',
    contractItems: '/master/contract-items',
  },
  orders:{
    contracts: '/contracts',
  },
  plants:{
    plantsList: '/master/plants',
    create: '/master/plant',
    update : '/master/plant',

  },
  notificationContent:{
NotificationContentList:'/master/notification-content',
 update : '/master/notification-content',
  },
  termAndCondition:{
    termAndConditionList: '/master/terms-conditions',
    create: '/master/terms-condition',
  },
  materialTypes:{
    materialTypesList: '/master/materialTypes',
    create: '/master/materialType',

  },
   Notification:{
    getNotificationList: '/buyer/notifications',

  },
  GeneralLedgerAccount:{
    generalLedgerAccountList: '/master/general-ledger-accounts',
    create: '/master/general-ledger-accounts',

  },
  paymentTerms:{
    paymentTermsList: '/master/paymentTerms',
  },
  states:{
    statesList: '/master/states',
  },
  items:{
    itemsList: '/master/items',
    create: '/master/item',
    update : '/master/item',
    restore: '/master/item',

  },
  financial:{
    FinancialList: '/master/financial-year',
  create:"/master/financial-year",
  update:"/master/financial-year",

  },
  countries:{
    countriesList: '/master/countries',
  },
  roles : {
    list : '/master/roles',
    create : '/master/role',
    update : '/master/role',
  },
  
 incoTerms:{
  list:'/master/inco-terms',
  create:'/master/inco-terms',
 },
  //Material
  materialGroup:{
    materialgrouplist : '/master/materialGroup',
    create:'/master/materialGroup',

  },
  Transaction:{
    TransactionList: '/master/transactions',
    transactiontable:'/master/transactions-history',
  },
  //Generics
  Generics : {
    getGenericList : "/master/generics",
    
  },
  Budget : {
    getbudgetcardList : "/master/business-department-budget",
    transfer : "/master/transfer-business-department-budget",
    assign:"/master/business-department-budget",
    approve:"/master/approve-business-department-budget",
  },
    
   Faq : {
    getFaq : "/master/knowledge-base/categories",
    getsearch:"/master/knowledge-base",
  },
    Faqbox : {
    getFaqbox : "/master/knowledge-base/",
    
  },
  FaqCategory:{
    getFaqCategory:"/master/knowledge-base/categories",
  },
   Profile : {
    getProfile : "/buyer/updateProfile",
    
  },
  CompanyCode:{
    companyCodeList: "/master/company-codes",
    create:'/master/company-codes',

  },
  //Manufacturer 
  Manufactuer : {
    manufacturerList : '/master/manufacturers',
    create:'/master/manufacturers',

  },
  PurchaseOrganisations : {
    PurchaseOrganisationsList : '/master/purchase-organisations',
    create:'/master/purchase-organisations',

  },
  Brands:{
    BrandList : '/master/brands',
  },

  BusinessDepartment : {
    BusinessDepartmentList : 'master/businessDepartment',
    restore: '/master/businessDepartment',

  },
  User: {
    UserList : 'buyer',
    restore:'/buyer/recover'
  },
  Log: {
    LogList :'/master/logs',
  },
  Common:{
    City : '/master/active/cities',
    State : '/master/active/states',
    Country : '/master/active/countries',
    count : '/master/count',
    BusinessDepartment : '/master/active/business-departments',
    Brand : '/master/active/brands',
    Generic : '/master/active/generics',
    categories : '/master/active/categories',
    auctionCategories : '/master/active/auction-categories',
    paymentTerms : '/master/active/payment-terms',
    cities : '/master/active/cities',
    states : '/master/active/states',
    countries : '/master/active/countries',
    plants : '/master/active/plants',
    items : '/master/active/items',
    materialTypes : '/master/active/material-types',
    contracts : '/master/active/contracts',
    Generics : '/master/active/generics',
    companyCodes : '/master/active/company-codes',
    incoTerms : '/master/active/inco-terms',
    roles : '/master/active/roles',
    GeneralLedgerAccount : '/master/active/general-ledger-accounts',
    materialGroup : '/master/active/material-groups',
    Transaction : '/master/active/transactions',
    buyers : '/master/active/buyers',
    Manufacturer:'/master/active/manufacturers',
    permission:'/master/active/permissions',
    manufacturers:'/master/active/manufacturers',
  },
// ======================================= Vendor API ===============================================

  vendorauction:{
    auctionbyId : '/auction',
    auctionList:'/vendor/getAuctionList',
    createAuctionApi:'/auction',
    templateApi:'/auction/template',
    communication:'auction/chat',
    fileupload:'/auction/chat/uploadFile',
    acceptOrReject:'/vendor/responce/auction'
  }

   
  
};

export default ENDPOINTS;


  // RFQ List
  // 1.pagination
  //  first,previous,{current Page} next,last
  // Advance Filter
  // 2 .DatePicker - Date Range
  // 3 Category : Master Category
  //  Multi DropDown
  // 4 Min-Max For Amount
  // 5 Export Filter and checked with export data

  // Supplier Responded Sort Drop Down 
  // low to high
  // high to low 
  // latest
  // oldest


  // Create RFQ
  // remove export
  // Advance Filter
  // 3 Category : Master Category
  //  Multi DropDown

  // Department Dynamic API

  // Vendor List 
  // Advance Filter
  // 1.Vendor City Name (tempCity) search
  // 2. Invited Vendor List DropDown Single
  // 3 remove payment terms /add category text from button

  // RFQ Vendor Detail Screen
  // Product List Show
  // Advance Filter 
  // Accepted Rfq
  // Amount Range

  // Amount Sort Drop Down 
  // low to high
  // high to low 
  // latest
  // oldest


  // RFQ Vendor Response Screen
  // Gray field which vendor not filed details


