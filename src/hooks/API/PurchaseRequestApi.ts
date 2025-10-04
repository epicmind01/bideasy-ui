import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../services/axiosClient';
import type { 
  PurchaseRequestData, 
  PurchaseRequestListParams, 
  PurchaseRequestListResponse,
  PurchaseRequestPayload
} from '../../Typings/PurchaseRequestTypes';

// Get Purchase Request List
export const useGetPurchaseRequestListApi = (params: PurchaseRequestListParams) => {
  return useQuery<PurchaseRequestListResponse>({
    queryKey: ['purchaseRequests', params],
    queryFn: async () => {
      const response = await axiosClient.get('/purchase-requests', { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get Purchase Request by ID
export const useGetPurchaseRequestByIdApi = (id: string) => {
  return useQuery<PurchaseRequestData>({
    queryKey: ['purchaseRequest', id],
    queryFn: async () => {
      const response = await axiosClient.get(`/purchase-requests/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create Purchase Request
export const useCreatePurchaseRequestApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: PurchaseRequestPayload) => {
      const response = await axiosClient.post('/purchase-requests', payload);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    },
  });
};

// Update Purchase Request
export const useUpdatePurchaseRequestApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: PurchaseRequestPayload & { id: string }) => {
      const { id, ...data } = payload;
      const response = await axiosClient.put(`/purchase-requests/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    },
  });
};

// Delete Purchase Request
export const useDeletePurchaseRequestApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.delete(`/purchase-requests/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    },
  });
};

// Clone Purchase Request
export const useClonePurchaseRequestApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.post(`/purchase-requests/${id}/clone`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    },
  });
};

// Approve or Reject Purchase Request
export const useApproveOrRejectPurchaseRequestApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: {
      purchaseRequestId: string;
      approvedById: string;
      status: string;
      remarks?: string;
    }) => {
      const response = await axiosClient.post('/purchase-requests/approve', payload);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
    },
  });
};

// Export Purchase Request
export const useExportPurchaseRequestApi = () => {
  return useMutation({
    mutationFn: async (params: PurchaseRequestListParams) => {
      const response = await axiosClient.get('/purchase-requests/export', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    },
  });
};
