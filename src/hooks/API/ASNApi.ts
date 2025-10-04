import { getLocalItem } from '../../Utils/Helpers';
import { LOCAL_STORAGE_KEYS } from '../../utils/LocalKeys';
import client from '../../services/axiosClient';
import { useMutation, useQuery } from '@tanstack/react-query';

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
    grnNumber: string;
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

export interface AdvanceSimpmentNoteDetailResponse {
  message: string;
  asn: AdvanceSimpmentNote;
}

interface AdvanceSimpmentNoteResponse {
  message: string;
  data: {
    advanceSimpmentNotes: AdvanceSimpmentNote[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

interface AsnPayload {
  asnId?: string;
}

export const useGetAdvanceSimpmentNoteList = (page?: number, limit?: number, searchObj?: Record<string, any>) => {
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
    queryKey: [`advanceSimpmentNote_${page}_${limit}`, searchObj],
    queryFn: () =>
      client.get(`/asn/getASNList?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    select: ({ data }: { data: AdvanceSimpmentNoteResponse }) => data?.data,
    enabled: true,
  });
};

export const useGetAdvanceSimpmentNoteByIdApi = (id: string) => {
  return useQuery({
    queryKey: [`advanceSimpmentNote_${id}`],
    queryFn: () =>
      client.get(`/asn/getASNDetails/${id}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    select: ({ data }: { data: AdvanceSimpmentNoteDetailResponse }) => data?.asn,
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
    