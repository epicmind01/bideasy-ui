import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../services/axiosClient';

interface Plant {
  id: string;
  name: string;
  code: string;
  address?: string;
  status: string;
}

interface PlantListResponse {
  data: Plant[];
  total: number;
  page: number;
  pageSize: number;
}

export const useGetAllPlantsList = (page: number = 1, limit: number = 100, search: string = '') => {
  return useQuery<PlantListResponse>({
    queryKey: ['plants', page, limit, search],
    queryFn: async () => {
      const response = await axiosClient.get('/plants', {
        params: { page, limit, search }
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
