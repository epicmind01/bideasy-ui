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

export interface AuctionData {
    id: string;
    name: string;
    eventCode: string;
    startTime: string;
    extendTime: string;
    status: string;
    Supplier_Responded: string;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export type AuctionStatus = 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'CLOSED' | 'AWARDED' | 'DELETED';
