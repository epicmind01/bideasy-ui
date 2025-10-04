import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "../../services/ENDPOINTS";
import { getLocalItem } from "../../Utils/Helpers";
import { LOCAL_STORAGE_KEYS } from "../../Utils/Helpers";
import client from "../../services/axiosClient";



// Products/Items API for CreateRFQ
export const useGetProductsForRFQApi = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string[];
}) => {
  return useQuery({
    queryKey: ["productsForRFQ", params],
    queryFn: async () => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get(ENDPOINTS.productsList, {
          params: {
            page: params?.page || 1,
            limit: params?.limit || 10,
            search: params?.search,
            category: params?.category,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
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

// Vendors API for CreateRFQ
export const useGetVendorsForRFQApi = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["vendorsForRFQ", params],
    queryFn: async () => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get(ENDPOINTS.venodrList, {
          params: {
            page: params?.page || 1,
            limit: params?.limit || 10,
            search: params?.search,
            status: params?.status,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
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

// Users/Collaborators API for CreateRFQ
export const useGetUsersForRFQApi = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
}) => {
  return useQuery({
    queryKey: ["usersForRFQ", params],
    queryFn: async () => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get(ENDPOINTS.buyersList, {
          params: {
            page: params?.page || 1,
            limit: params?.limit || 10,
            search: params?.search,
            department: params?.department,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
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
