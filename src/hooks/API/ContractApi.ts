import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../services/axiosClient';
import type { 
  ContractData, 
  ContractListParams, 
  ContractListResponse,
  ContractItemListParams,
  ContractItemListResponse
} from '../../Typings/ContractTypes';

// Get Contract List
export const useGetContractListApi = (params: ContractListParams) => {
  return useQuery<ContractListResponse>({
    queryKey: ['contracts', params],
    queryFn: async () => {
      const response = await axiosClient.get('/contracts', { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get Contract Items List
export const useGetContractItemsListApi = (params: ContractItemListParams) => {
  return useQuery<ContractItemListResponse>({
    queryKey: ['contractItems', params],
    queryFn: async () => {
      const response = await axiosClient.get('/contract-items', { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get Contract by ID
export const useGetContractByIdApi = (id: string) => {
  return useQuery<{ contract: ContractData }>({
    queryKey: ['contract', id],
    queryFn: async () => {
      const response = await axiosClient.get(`/contracts/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Delete Contract
export const useDeleteContractApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.delete(`/contracts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

// Clone Contract
export const useCloneContractApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.post(`/contracts/${id}/clone`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

// Export Contract
export const useExportContractApi = () => {
  return useMutation({
    mutationFn: async (params: ContractListParams) => {
      const response = await axiosClient.get('/contracts/export', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    },
  });
};

// Get All Contract List (with pagination)
export const useGetAllContractList = (page: number = 1, limit: number = 10, search: string = '', filterDeleted: string = '') => {
  return useQuery({
    queryKey: ['contracts', page, limit, search, filterDeleted],
    queryFn: async () => {
      const response = await axiosClient.get(`/contracts?page=${page}&limit=${limit}&search=${search}&filterDeleted=${filterDeleted}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Update Contract Status
export const useUpdateContractStatusApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ contractId, status, startDate, endDate }: { 
      contractId: string; 
      status: string; 
      startDate: Date; 
      endDate: Date; 
    }) => {
      const response = await axiosClient.post(`/contracts/${contractId}/status-update`, {
        status,
        startDate,
        endDate
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract_detail'] });
    },
  });
};
