import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../services/axiosClient';
import type { 
  ArcReportData, 
  ArcReportListParams, 
  ArcReportListResponse 
} from '../../Typings/ArcReportTypes';

// Get ARC Reports List
export const useGetArcReportsListApi = (params: ArcReportListParams) => {
  return useQuery<ArcReportListResponse>({
    queryKey: ['arcReports', params],
    queryFn: async () => {
      const response = await axiosClient.get('/arc-reports', { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get ARC Report by ID
export const useGetArcReportByIdApi = (id: string) => {
  return useQuery<{ arcReport: ArcReportData }>({
    queryKey: ['arcReport', id],
    queryFn: async () => {
      const response = await axiosClient.get(`/arc-reports/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Delete ARC Report
export const useDeleteArcReportApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.delete(`/arc-reports/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arcReports'] });
    },
  });
};

// Clone ARC Report
export const useCloneArcReportApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosClient.post(`/arc-reports/${id}/clone`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arcReports'] });
    },
  });
};

// Export ARC Report
export const useExportArcReportApi = () => {
  return useMutation({
    mutationFn: async (params: ArcReportListParams) => {
      const response = await axiosClient.get('/arc-reports/export', { 
        params,
        responseType: 'blob'
      });
      return response.data;
    },
  });
};

// Approve or Reject ARC Report
export const useApproveOrRejectArcReportApi = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: {
      arcReportId: string;
      approvedById: string;
      remarks: string;
      status: string;
    }) => {
      const response = await axiosClient.post('/arc-reports/approve-reject', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arcReport'] });
      queryClient.invalidateQueries({ queryKey: ['arcReports'] });
    },
  });
};
