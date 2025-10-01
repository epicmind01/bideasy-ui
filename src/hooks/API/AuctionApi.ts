import ENDPOINTS from "../../services/ENDPOINTS";
import type { AuctionListResponse } from "../../Typings/AuctionTypes";
import { getLocalItem } from "../../Utils/Helpers";
import { LOCAL_STORAGE_KEYS } from "../../Utils/Helpers";
import { useMutation, useQuery } from "@tanstack/react-query";
import client from "../../services/axiosClient";


interface AuctionListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export const useGetAuctionListApi = (params?: AuctionListParams) => {
    return useQuery<AuctionListResponse>({
      queryKey: ["auctionList", params],
      queryFn: async (): Promise<AuctionListResponse> => {
        try {
          const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);       
          if (!token) {
            throw new Error("No authentication token found");
          }
  
          const response = await client.get<AuctionListResponse>(
            ENDPOINTS.auction.list,
            {
              params: {
                page: params?.page,
                limit: params?.pageSize, // Changed from pageSize to limit
                search: params?.search,
                status: params?.status,
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.data) {
            throw new Error("No data received from server");
          }
          return response.data;
        } catch (error) {
          console.error("API Error:", error);
          throw error;
        }
      },
      meta: {
        onError: (error: unknown) => {
          console.error("Query Error in meta:", error);
        },
      },
    });
  };


export const useDeleteAuctionApi = () => {
  return useMutation({
    mutationFn: (id: string) => client.delete(`${ENDPOINTS.auction.delete}/${id}`),
  });
}