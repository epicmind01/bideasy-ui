import { getLocalItem } from '../../utils/Helpers';
import { LOCAL_STORAGE_KEYS } from '../../utils/LocalKeys';
import client from '../../services/axiosClient';
import ENDPOINTS from '../../services/ENDPOINTS';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { 
  PurchaseRequest, 
  PurchaseOrder, 
  PurchaseRequestItem, 
  AdvanceSimpmentNote, 
  GoodReceiptNote, 
  Invoice 
} from '../../Typings/PurchaseOrderTypes';

export interface PurchaseRequestPayload {
  id?: string;
  title: string;
  organisationId: string;
  companyCodeId?: string;
  vendorId?: string;
  plantId: string;
  plantAddress?: string;
  deliveryDate: string;
  purpose?: string;
  remarks?: string;
  priority: string;
  requisitionType: string;
  items: any[];
  contractNumber: string;
  isDraft?: boolean;
}

export interface PurchaseOrderPayload {
  id?: string;
  title?: string;
  organisationId?: string;
  companyCodeId?: string;
  departmentid?: string;
  vendorId?: string;
  plantId?: string;
  items?: any[];
  contractNumber?: string;
  isDraft?: boolean;
  isEditable?: boolean;
  status?: string;
}

export interface PurchaseRequestDetailResponse {
  message: string;
  purchaseRequest: PurchaseRequest;
}

export interface PurchaseRequestResponse {
  message: string;
  data: {
    purchaseRequests: PurchaseRequest[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface PurchaseOrderResponse {
  message: string;
  data: {
    purchaseOrders: PurchaseOrder[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface PurchaseOrderDetailResponse {
  message: string;
  purchaseOrder: PurchaseOrder;
}

export interface AdvanceSimpmentNoteResponse {
  message: string;
  data: {
    advanceSimpmentNotes: AdvanceSimpmentNote[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface AdvanceSimpmentNoteDetailResponse {
  message: string;
  asn: AdvanceSimpmentNote;
}

export interface GoodReceiptNoteResponse {
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

export interface InvoiceResponse {
  message: string;
  data: {
    invoices: Invoice[];
    totalCount: number;
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  };
}

interface IStatusPurchasepayload {
  purchaseRequestId: string;
  approvedById: string | number;
  status: string;
  remarks?: string;
}

interface IStatusPurchaseOrderpayload {
  purchaseOrderId: string;
  approvedById: string | number;
  status: string;
  remarks?: string;
}

interface ApproveInvoicePayload {
  invoiceId: string;
  approvedById: string;
  status: 'APPROVED' | 'REJECTED' | 'REVISED';
  remarks?: string;
  documentUrls?: string[];
}

// Purchase Request APIs
export const useCreatePurchaseRequestApi = () => {
  return useMutation((payload: PurchaseRequestPayload) => {
    return client.post(ENDPOINTS.createPurchaseRequest, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
      },
    });
  });
};

export const useGetPurchaseRequestByIdApi = (id: string) => {
  return useQuery(
    [`purchaseRequest_${id}`],
    () =>
      client.get(`${ENDPOINTS.getPurchaseRequest}/${id}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    {
      select: ({ data }: { data: PurchaseRequestDetailResponse }) => data?.purchaseRequest,
      enabled: !!id,
    }
  );
};

export const useUpdatePurchaseRequestApi = () => {
  return useMutation((payload: PurchaseRequestPayload) => {
    return client.put(`${ENDPOINTS.updatePurchaseRequest}/${payload?.id}`, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
      },
    });
  });
};

export const useClonePurchaseRequestApi = () => {
  return useMutation((payload: { purchaseRequestId: string }) => {
    return client.post(ENDPOINTS.clonePurchaseRequest, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
      },
    });
  });
};

export const useDeletePurchaseRequestApi = () => {
  return useMutation((payload: { purchaseRequestId: string }) => {
    return client.delete(`${ENDPOINTS.deletePurchaseRequest}/${payload?.purchaseRequestId}`, {
      headers: {
        Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
      },
    });
  });
};

export const useGetPurchaseRequestListQuery = (page?: number, limit?: number, searchObj?: Record<string, any>) => {
  const query = new URLSearchParams();

  if (page) {
    query.append('page', String(page));
  }
  if (limit) {
    query.append('pageSize', String(limit));
  }

  if (searchObj) {
    Object.entries(searchObj).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => query.append(`${key}[]`, String(val)));
      } else if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
  }

  return useQuery(
    [`purchaseRequest_${page}_${limit}`, searchObj],
    () =>
      client.get(`${ENDPOINTS.getPurchaseRequestList}?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    {
      select: ({ data }: { data: PurchaseRequestResponse }) => data?.data,
      enabled: true,
    }
  );
};

export const useApproveOrRejectPurchaseRequestApi = () => {
  return useMutation((payload: IStatusPurchasepayload) => {
    return client.post(ENDPOINTS.approvePurchaseRequest, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
      },
    });
  });
};

// Purchase Order APIs
export const useClonePurchaseOrderApi = () => {
  return useMutation({
    mutationFn: (payload: { purchaseOrderId: string }) => {
      return client.post(ENDPOINTS.clonePurchaseOrder, payload, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      });
    },
  });
};

export const useDeletePurchaseOrderApi = () => {
  return useMutation({
    mutationFn: (payload: { purchaseOrderId: string }) => {
      return client.delete(`${ENDPOINTS.deletePurchaseOrder}/${payload?.purchaseOrderId}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      });
    },
  });
};

export const useGetPurchaseOrderList = (page?: number, limit?: number, searchObj?: Record<string, any>) => {
  const query = new URLSearchParams();

  if (page) {
    query.append('page', String(page));
  }
  if (limit) {
    query.append('pageSize', String(limit));
  }

  if (searchObj) {
    Object.entries(searchObj).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => query.append(`${key}[]`, String(val)));
      } else if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
  }

  return useQuery(
    [`purchaseOrder_${page}_${limit}`, searchObj],
    () =>
      client.get(`${ENDPOINTS.getPurchaseOrderList}?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    {
      select: ({ data }: { data: PurchaseOrderResponse }) => data?.data,
      enabled: true,
    }
  );
};

export const useGetPurchaseOrderByIdApi = (id: string) => {
  return useQuery(
    [`purchaseOrder_${id}`],
    () =>
      client.get(`${ENDPOINTS.getPurchaseOrder}/${id}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    {
      select: ({ data }: { data: PurchaseOrderDetailResponse }) => data?.purchaseOrder,
      enabled: !!id,
    }
  );
};

export const useUpdatePurchaseOrderApi = () => {
  return useMutation((payload: PurchaseOrderPayload) => {
    const { id, ...bodyData } = payload;
    return client.put(`${ENDPOINTS.updatePurchaseOrder}/${id}`, bodyData, {
      headers: {
        Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
      },
    });
  });
};

export const useUpdateAuctionPurchaseOrderApi = () => {
  return useMutation((payload: PurchaseOrderPayload) => {
    const { id, ...bodyData } = payload;
    return client.put(`${ENDPOINTS.updateAuctionPurchaseOrder}/${id}`, bodyData, {
      headers: {
        Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
      },
    });
  });
};

export const useGetPurchaseOrderChangeLogsApi = (id: string, page?: number, limit?: number) => {
  return useQuery(
    [`purchaseOrderChangeLogs_${id}_${page}_${limit}`],
    () =>
      client.get(`${ENDPOINTS.getPurchaseOrderChangeLogs}/${id}?page=${page || 1}&limit=${limit || 10}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    {
      select: ({ data }: { data: any }) => data?.data,
      enabled: !!id,
    }
  );
};

export const useApproveOrRejectPurchaseOrderApi = () => {
  return useMutation((payload: IStatusPurchaseOrderpayload) => {
    return client.post(ENDPOINTS.approvePurchaseOrder, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
      },
    });
  });
};

export const useCreateFromWithdrawnPOApi = () => {
  return useMutation((payload: { withdrawnPoId: string; newVendorId: string; items: any[] }) => {
    return client.post(ENDPOINTS.createFromWithdrawnPO, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
      },
    });
  });
};

export const useCreateManualPOApi = () => {
  return useMutation((payload: { prId: string; vendorId: string; items: any[] }) => {
    return client.post(ENDPOINTS.createManualPO, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
      },
    });
  });
};

// Create multiple POs from PRs
export const useCreateMultiplePOsFromPRs = () => {
  return useMutation(
    (payload: {
      selectedPRs: Array<{
        vendorId: string;
        prs: Array<{
          prId: string;
          items: Array<{
            itemId: string;
            quantity: number;
            price: number;
          }>;
        }>;
      }>;
      createdById: string;
    }) =>
      client.post(ENDPOINTS.createMultiplePOsFromPRs, payload, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      })
  );
};

// ASN APIs
export const useGetAdvanceSimpmentNoteList = (page?: number, limit?: number, searchObj?: Record<string, any>) => {
  const query = new URLSearchParams();

  if (page) {
    query.append('page', String(page));
  }
  if (limit) {
    query.append('pageSize', String(limit));
  }

  if (searchObj) {
    Object.entries(searchObj).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => query.append(`${key}[]`, String(val)));
      } else if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
  }

  return useQuery(
    [`advanceSimpmentNote_${page}_${limit}`, searchObj],
    () =>
      client.get(`${ENDPOINTS.getAdvanceSimpmentNoteList}?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    {
      select: ({ data }: { data: AdvanceSimpmentNoteResponse }) => data?.data,
      enabled: true,
    }
  );
};

export const useGetAdvanceSimpmentNoteByIdApi = (id: string) => {
  return useQuery(
    [`advanceSimpmentNote_${id}`],
    () =>
      client.get(`${ENDPOINTS.getAdvanceSimpmentNoteDetails}/${id}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    {
      select: ({ data }: { data: AdvanceSimpmentNoteDetailResponse }) => data?.asn,
      enabled: !!id,
    }
  );
};

// GRN APIs
export const useGetGoodsReceivedNoteList = (page?: number, limit?: number, searchObj?: Record<string, any>) => {
  const query = new URLSearchParams();

  if (page) {
    query.append('page', String(page));
  }
  if (limit) {
    query.append('pageSize', String(limit));
  }

  if (searchObj) {
    Object.entries(searchObj).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => query.append(`${key}[]`, String(val)));
      } else if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
  }

  return useQuery(
    [`goodsReceivedNote_${page}_${limit}`, searchObj],
    () =>
      client.get(`${ENDPOINTS.getGRNList}?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    {
      select: ({ data }: { data: GoodReceiptNoteResponse }) => data?.data,
      enabled: true,
    }
  );
};

export const useGetGrnByIdApi = (asnId: string) => {
  return useQuery(
    [`purchaseOrder_${asnId}`],
    () =>
      client.get(`${ENDPOINTS.getGRNDetails}/${asnId}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    {
      select: ({ data }: { data: GrnDetailResponse }) => data?.grn,
      enabled: !!asnId,
    }
  );
};

export const useCreateGrnApi = () => {
  return useMutation((payload: any) => {
    return client.post(ENDPOINTS.createGeneralReceiptNote, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
      },
    });
  });
};

export const useUpdateAsnApi = () => {
  return useMutation((payload: any) => {
    return client.put(`${ENDPOINTS.updateGeneralReceiptNote}/${payload?.asnId}`, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
      },
    });
  });
};

export const useUpdateGrnApi = () => {
  return useMutation((payload: FormData) => {
    return client.put(`${ENDPOINTS.updateGeneralReceiptNote}`, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
      },
    });
  });
};

// Invoice APIs
export const useGetAllInvoicesApi = (page?: number, limit?: number, searchObj?: Record<string, any>) => {
  const query = new URLSearchParams();

  if (page) {
    query.append('page', String(page));
  }
  if (limit) {
    query.append('pageSize', String(limit));
  }

  if (searchObj) {
    Object.entries(searchObj).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => query.append(`${key}[]`, String(val)));
      } else if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
  }

  return useQuery(
    [`goodsReceivedNote_${page}_${limit}`, searchObj],
    () =>
      client.get(`${ENDPOINTS.getInvoiceList}?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    {
      select: ({ data }: { data: InvoiceResponse }) => data?.data,
      enabled: true,
    }
  );
};

export const useGetAllraBillsApi = (page?: number, limit?: number, searchObj?: Record<string, any>) => {
  const query = new URLSearchParams();

  if (page) {
    query.append('page', String(page));
  }
  if (limit) {
    query.append('pageSize', String(limit));
  }

  if (searchObj) {
    Object.entries(searchObj).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => query.append(`${key}[]`, String(val)));
      } else if (value !== undefined && value !== null) {
        query.append(key, String(value));
      }
    });
  }

  return useQuery(
    [`goodsReceivedNote_${page}_${limit}`, searchObj],
    () =>
      client.get(`${ENDPOINTS.getraBillsList}?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    {
      select: ({ data }: { data: InvoiceResponse }) => data?.data,
      enabled: true,
    }
  );
};

export const useInvoiceById = (invoiceId: string) => {
  return useQuery(
    [`purchaseOrder_${invoiceId}`],
    () =>
      client.get(`${ENDPOINTS.getVendorInvoiceDetails}/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    {
      select: ({ data }: { data: { message: string; invoice: Invoice } }) => data?.invoice,
      enabled: !!invoiceId,
    }
  );
};

export const useApproveInvoice = () => {
  return useMutation((payload: ApproveInvoicePayload) => {
    return client.post(ENDPOINTS.approveInvoice, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
      },
    });
  });
};

export const useApproveRaBills = () => {
  return useMutation((payload: ApproveInvoicePayload) => {
    return client.post(ENDPOINTS.approveRaBills, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
      },
    });
  });
};

// New hooks for getting ASN, GRN, and Invoice lists by PO ID
export const useGetASNListByPOId = (poId: string) => {
  return useQuery(
    [`asnListByPO_${poId}`],
    () =>
      client.get(`${ENDPOINTS.getAdvanceSimpmentNoteList}?poId=${poId}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    {
      select: ({ data }: { data: AdvanceSimpmentNoteResponse }) => data?.data?.advanceSimpmentNotes || [],
      enabled: !!poId,
    }
  );
};

export const useGetGRNListByPOId = (poId: string) => {
  return useQuery(
    [`grnListByPO_${poId}`],
    () =>
      client.get(`${ENDPOINTS.getGRNList}?poId=${poId}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    {
      select: ({ data }: { data: GoodReceiptNoteResponse }) => data?.data?.grns || [],
      enabled: !!poId,
    }
  );
};

export const useGetInvoiceListByPOId = (poId: string) => {
  return useQuery(
    [`invoiceListByPO_${poId}`],
    () =>
      client.get(`${ENDPOINTS.getInvoiceList}?poId=${poId}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    {
      select: ({ data }: { data: InvoiceResponse }) => data?.data?.invoices || [],
      enabled: !!poId,
    }
  );
};

// Credit Note API hooks
export const useGetCreditNotes = (invoiceId: string) => {
  return useQuery(
    [`creditNotes_${invoiceId}`],
    () =>
      client.get(`${ENDPOINTS.getCreditNotes}/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
        },
      }),
    {
      select: ({ data }: { data: any }) => data?.creditNotes || [],
      enabled: !!invoiceId,
    }
  );
};

// Create GRN from Invoice API hook
export const useCreateGRNFromInvoice = () => {
  return useMutation((payload: { invoiceId: string; remarks?: string }) => {
    return client.post(ENDPOINTS.createGRNFromInvoice, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
      },
    });
  });
};
