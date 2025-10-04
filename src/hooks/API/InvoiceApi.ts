import { useMutation, useQuery } from '@tanstack/react-query';
import client from '../../services/axiosClient';
import ENDPOINTS from '../../services/ENDPOINTS';
import type { Invoice, InvoiceResponse, ApproveInvoicePayload } from '../../Typings/InvoiceTypes';
import { getLocalItem } from '../../utils/Helpers';

export const useGetAllInvoicesApi = (page?: number, limit?: number, searchObj?: Record<string, any>) => {
  const query = new URLSearchParams();

  // Add pagination parameters
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
    [`invoices_${page}_${limit}`, searchObj],
    () =>
      client.get(`${ENDPOINTS.getInvoiceList}?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem('TOKEN')}`,
        },
      }),
      select: ({ data }: { data: InvoiceResponse }) => data?,
   
  );
};

export const useGetAllraBillsApi = (page?: number, limit?: number, searchObj?: Record<string, any>) => {
  const query = new URLSearchParams();

  // Add pagination parameters
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
    [`raBills_${page}_${limit}`, searchObj],
    () =>
      client.get(`${ENDPOINTS.getraBillsList}?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem('TOKEN')}`,
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
    [`invoice_${invoiceId}`],
    () =>
      client.get(`${ENDPOINTS.getVendorInvoiceDetails}/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem('TOKEN')}`,
        },
      }),
    {
    
      select: ({ data }: { data: InvoiceResponse }) => ({
        message: data?.message ?? '',
        data: data?.data ?? [],
        currentPage: data?.currentPage ?? 1,
        pageSize: data?.pageSize ?? 10,
        total: data?.total ?? 1,
        totalPages: data?.totalPages ?? 1,
      }),
      enabled: !!invoiceId,
    }
  );
};

export const useApproveInvoice = () => {
  return useMutation((payload: ApproveInvoicePayload) => {
    return client.post(ENDPOINTS.approveInvoice, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem('TOKEN')}`,
      },
    });
  });
};

export const useApproveRaBills = () => {
  return useMutation((payload: ApproveInvoicePayload) => {
    return client.post(ENDPOINTS.approveRaBills, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem('TOKEN')}`,
      },
    });
  });
};

export const useGetCreditNotes = (invoiceId: string) => {
  return useQuery(
    [`creditNotes_${invoiceId}`],
    () =>
      client.get(`${ENDPOINTS.getCreditNotes}/${invoiceId}`, {
        headers: {
          Authorization: `Bearer ${getLocalItem('TOKEN')}`,
        },
      }),
    {
      select: ({ data }: { data: any }) => data?.creditNotes || [],
      enabled: !!invoiceId,
    }
  );
};

export const useCreateGRNFromInvoice = () => {
  return useMutation((payload: { invoiceId: string; remarks?: string }) => {
    return client.post(ENDPOINTS.createGRNFromInvoice, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem('TOKEN')}`,
      },
    });
  });
};

export const useUpdatePurchaseOrderApi = () => {
  return useMutation((payload: { id: string; isEditable: boolean }) => {
    return client.put(`${ENDPOINTS.updatePurchaseOrder}/${payload.id}`, payload, {
      headers: {
        Authorization: `Bearer ${getLocalItem('TOKEN')}`,
      },
    });
  });
};

