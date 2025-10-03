export interface User {
    id: string;
    email: string;
    employeeId: string;
    mobile: string;
    address: string;
    bio: string;
    avatar: string;
    name: string;
    createdById: string;
    password: string;
    companyName: string;
    userType: string;
    prAutoStatus: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
    buyerRoleAssignment: BuyerRoleAssignment[];
    lastLogin: string;
    head:BuildBy;
    createdBy:BuildBy;
    _count:{
        ARCApproval: number;
        AuctionTemplate: number;
        Collaboration: number;
        MasterCategoryApproved: number;
        MasterCategoryCreated: number;
        MasterMaterialGroupApproved: number;
        MasterMaterialGroupCreated: number;
        MasterPaymentTermsAppvoed : number;
        MasterPaymentTermsCreated: number;
        RFQEvent: number;
        approvals: number;
        coCreatedAuctions: number;
        createdARCReports: number;
        createdBuyers: number;
        invitedVendors: number;
        subordinates: number;
    }
}

export interface BuildBy {
    id: string;
    name: string;
}

export interface BuyerRoleAssignment {
    id: string;
    buyerId: string;
    roleId: string;
    createdAt: string;
    role: Role;
}

export interface Role {
    id: string;
    title: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
export interface UserResponse {
  user: User;
}