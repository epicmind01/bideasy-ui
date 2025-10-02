import ENDPOINTS from "../../services/ENDPOINTS";
import type { AuctionListParams, AuctionListResponse, AuctionResponse, CloneAuctionPayload } from "../../Typings/AuctionTypes";
import { getLocalItem } from "../../Utils/Helpers";
import { LOCAL_STORAGE_KEYS } from "../../Utils/Helpers";
import { useMutation, useQuery } from "@tanstack/react-query";
import client from "../../services/axiosClient";



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

  export const useGetAuctionByIdApi = (id?: string) => {
    return useQuery<AuctionResponse>({
      queryKey: ["auctionById", id],
      queryFn: async (): Promise<AuctionResponse> => {
        try {
          const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);       
          if (!token) {
            throw new Error("No authentication token found");
          }
          const response = await client.get<AuctionResponse>(
            `${ENDPOINTS.auction.base}/${id}`,
            {
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
  }

// Invite vendors to an auction using the notify endpoint
export const useNotifyVendorToAuctionApi = () => {
  return useMutation({
    mutationFn: async ({ auctionId, vendorIds }: { auctionId: string; vendorIds: string[] }) => {
      const response = await client.post(
        `${ENDPOINTS.auction.base}/notify/${auctionId}`,
        { vendorIds },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
          },
        }
      );
      return response.data;
    },
    onError: (error: unknown) => {
      console.error('Failed to notify vendors:', error);
    },
  });
};


export const useDeleteAuctionApi = () => {
  return useMutation({
    mutationFn: (id: string) => client.delete(`${ENDPOINTS.auction.delete}/${id}`),
  });
}



export const useCloneAuctionApi = () => {
  return useMutation({
    mutationFn: (payload: CloneAuctionPayload) => {
      return client.post(
        `${ENDPOINTS.auction.base}/${payload.auctionId}/clone`,
        { 
          name: payload.name,
          startTime: payload.startTime,
          endTime: payload.endTime
        },
        {
          headers: {
            Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
          },
        }
      );
    }
  });
};

