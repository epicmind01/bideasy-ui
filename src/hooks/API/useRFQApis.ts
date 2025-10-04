import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../services/axiosClient';

interface Vendor {
  id: string;
  name: string;
  email: string;
  vendorCode: string;
  tempCompanyName?: string;
  tempName?: string;
  status: string;
}

interface VendorListResponse {
  vendors: Vendor[];
  total: number;
  page: number;
  pageSize: number;
}

interface VendorListParams {
  page?: number;
  limit?: number;
  search?: string;
  typeOfSupplier?: string;
}

export const useGetAllVendorListApi = (
  page: number = 1,
  limit: number = 100,
  search: string = '',
  filters: VendorListParams = {}
) => {
  return useQuery<VendorListResponse>({
    queryKey: ['vendors', page, limit, search, filters],
    queryFn: async () => {
      const response = await axiosClient.get('/vendors', {
        params: { page, limit, search, ...filters }
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
