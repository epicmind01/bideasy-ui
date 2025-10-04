import { getLocalItem, LOCAL_STORAGE_KEYS } from "../../utils/Helpers";
import client from '../../services/axiosClient';
import { useMutation, useQuery } from '@tanstack/react-query';

export interface GoodReceiptNote {
  id: string;
  grnNumber: string;
  asn: AdvanceSimpmentNote;
  asnId: string;
  vendorId: string;
  status: "PENDING" | "COMPLETED" | "REJECTED";
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  receivedByDate?: string;
  securityNumber?: string;
  GoodReceiptNoteItem: {
    id: string;
    grnId: string;
    itemId: string;
    quantity: number;
    totalQuantity: number;
    quantityRejected?: number;
    reasonForRejection?: string;
    expiryDate?: string;
    item: {
      id: string;
      itemCode: string;
      MasterGeneric?: {
        name: string;
      };
    };
  }[];
  GRNAttachment: {
    id: string;
    fileName: string;
    fileUrl: string;
    fileType?: string;
  }[];
  vendor: {
    id: string;
    tempName: string;
    email?: string;
  };
  Invoice?: any[];
}

export interface AdvanceSimpmentNote {
  id: string;
  title?: string;
  asnNumber: string;
  poId: string;
  purchaseOrder: {
    id: string;
    purchaseOrderNumber: string;
  };
  vendorId: string;
  vendor: {
    id: string;
    tempName: string;
  };
  shipmentReference: string;
  expectedDeliveryDate?: string;
  ewayBillNumber?: string;
  acknowledgedBy?: string;
  comments?: string;
  carrierName?: string;
  trackingNumber?: string;
  deliveryAddress?: string;
  loadingInstruction?: string;
  shipmentMethod?: string;
  status: "PENDING" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  AdvanceSimpmentNoteItem: AdvanceSimpmentNoteItem[];
  ASNAttachment: AsnAttachment[];
  GoodReceiptNote?: {
    id: string;
  }[];
}

export interface AdvanceSimpmentNoteItem {
  id: string;
  asnId: string;
  itemId: string;
  item: {
    id: string;
    itemCode: string;
    MasterGeneric?: {
      name: string;
    };
  };
  quantity: number;
  totalQuantity: number;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AsnAttachment {
  id: string;
  asnId: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface GoodReceiptNoteResponse {
  message: string;
  data: {
    grns: GoodReceiptNote[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface GrnDetailResponse {
  message: string;
  grn: GoodReceiptNote;
}

interface AsnPayload {
  asnId?: string;
}

export const useGetGoodsReceivedNoteList = (page?: number, limit?: number, searchObj?: Record<string, any>) => {
  const query = new URLSearchParams();

  // Add pagination parameters
  if (page) {
    query.append('page', String(page));
  }
  if (limit) {
    query.append('limit', String(limit));
  }

  // Add search parameters
  if (searchObj) {
    Object.entries(searchObj).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    });
  }

  return useQuery({
    queryKey: [`goodsReceivedNote_${page}_${limit}`, searchObj],
    queryFn: () =>
      client.get(`/grn/getGRNList?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    select: ({ data }: { data: GoodReceiptNoteResponse }) => data?.data,
    enabled: true,
  });
};

export const useGetGrnByIdApi = (asnId: string) => {
  return useQuery({
    queryKey: [`grn_${asnId}`],
    queryFn: () =>
      client.get(`/grn/getGRNDetails/${asnId}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    select: ({ data }: { data: GrnDetailResponse }) => data?.grn,
    enabled: true,
  });
};

export const useCreateGrnApi = () => {
  return useMutation({
    mutationFn: (payload: AsnPayload) => {
      return client.post('/grn/createGRN', payload, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      });
    }
  });
};

export const useUpdateGrnApi = () => {
  return useMutation({
    mutationFn: (payload: FormData) => {
      return client.put('/grn/updateGRN', payload, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      });
    }
  });
};
