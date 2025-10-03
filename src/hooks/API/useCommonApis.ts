import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "../../services/ENDPOINTS";
import client from "../../services/axiosClient";
import { getLocalItem } from "../../Utils/Helpers";
import { LOCAL_STORAGE_KEYS } from "../../Utils/Helpers";

// Type definitions for API responses
interface CityResponse {
  id: string | number;
  name: string;
  [key: string]: any;
}

interface StateResponse {
  id: string | number;
  name: string;
  [key: string]: any;
}

interface CountryResponse {
  data: Array<{
    id: string | number;
    name: string;
    [key: string]: any;
  }>;
}

type ApiResponseItem = {
  id: string | number;
  name: string;
  [key: string]: any;
};

type ApiResponse<T> = {
  data: T[];
  message?: string;
  success?: boolean;
};

export interface MasterCountResponse {
  message: string;
  data: Array<{
    title: string;
    groupTitle: string;
    items: Array<{
      description: string | undefined;
      title: string;
      count: number;
      path: string;
      allowPermission: string[];
      icon: React.ReactNode;
      accentColor: string;
      iconBgColor: string;
      subtitle?: string;
    }>;
  }>;
}

export const useGetMasterCountApi = () => {
  return useQuery<MasterCountResponse>({
    queryKey: ["MasterCount"],
    queryFn: async (): Promise<MasterCountResponse> => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);       
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get<MasterCountResponse>(
          ENDPOINTS.Common.count,
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
};
// ✅ Get All Cities
export const useGetCityApi = () => {
  return useQuery<CityResponse[]>({
      queryKey: ["CityNames"],
      queryFn: async (): Promise<CityResponse[]> => {
        const res = await client.get<{ data: CityResponse[] }>(
          ENDPOINTS.Common.City,
          {
            headers: {
              Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
            },
          }
        );
        return res.data.data;
      },
      meta: {
        onError: (error: unknown) => {
          console.error("Query Error:", error);
        },
      },
    });
  };
  
  // ✅ Get Cities by State Id
  export const useGetCitiesByStateIdApi = (stateId: string) => {
    return useQuery<CityResponse[]>({
      queryKey: ["CitiesByState", stateId],
      queryFn: async (): Promise<CityResponse[]> => {
        const res = await client.get<{ data: CityResponse[] }>(
          `${ENDPOINTS.Common.City}/${stateId}`,
          {
            headers: {
              Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
            },
          }
        );
        return res.data.data;
      },
      enabled: !!stateId,
      meta: {
        onError: (error: unknown) => {
          console.error("Query Error:", error);
        },
      },
    });
  };
  
  // ✅ Get States
  export const useGetStateApi = () => {
  return useQuery<StateResponse[]>({
      queryKey: ["StateNames"],
      queryFn: async (): Promise<StateResponse[]> => {
        const res = await client.get<{ data: StateResponse[] }>(
          ENDPOINTS.Common.State,
          {
            headers: {
              Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
            },
          }
        );
        return res.data.data;
      },
      meta: {
        onError: (error: unknown) => {
          console.error("Query Error:", error);
        },
      },
    });
  };
export const useGetStateListByCountryIdApi = (id: string) => {
  return useQuery<StateResponse[]>({
    queryKey: ["StateListByCountryId", id],
    queryFn: async (): Promise<StateResponse[]> => {
      const res = await client.get<{ data: StateResponse[] }>(
        `${ENDPOINTS.Common.State}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
          },
        }
      );
      return res.data.data;
    },
    enabled: !!id,
    meta: {
      onError: (error: unknown) => {
        console.error("Query Error:", error);
      },
    },
  });
};

export const useGetCountryApi = () => {
  return useQuery<CountryResponse['data']>({
    queryKey: ["countries"],
    queryFn: async (): Promise<CountryResponse['data']> => {
      const res = await client.get<CountryResponse>(
        ENDPOINTS.Common.Country,
        {
          headers: {
            Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
          },
        }
      );
      return res.data.data;
    },
    meta: {
      onError: (error: unknown) => {
        console.error("Query Error:", error);
      },
    },
  });
};

export const useGetActiveBrandApi = () => {
  return useQuery<unknown[]>({
    queryKey: ["brands"],
    queryFn: async (): Promise<unknown[]> => {
      const res = await client.get<{ data: unknown[] }>(
        ENDPOINTS.Common.Brand,
        {
          headers: {
            Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
          },
        }
      );
      return res.data.data;
    },
    meta: {
      onError: (error: unknown) => {
        console.error("Query Error:", error);
      },
    },
  });
};

export const useGetActiveGenericApi = () => {
  return useQuery<unknown[]>({
    queryKey: ["generics"],
    queryFn: async (): Promise<unknown[]> => {
      const res = await client.get<{ data: unknown[] }>(
        ENDPOINTS.Common.Generic,
        {
          headers: {
            Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
          },
        }
      );
      return res.data.data;
    },
    meta: {
      onError: (error: unknown) => {
        console.error("Query Error:", error);
      },
    },
  });
};

export const useGetActiveBusinessDepartment = () => {
  return useQuery<ApiResponse<ApiResponseItem>, unknown>({
    queryKey: ["businessDepartments"],
    queryFn: async (): Promise<ApiResponse<ApiResponseItem>> => {
      const response = await client.get<ApiResponse<ApiResponseItem>>(
        ENDPOINTS.Common.BusinessDepartment,
        {
          headers: {
            Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
          },
        }
      );
      return response.data;
    },
    meta: {
      onError: (error: unknown) => {
        console.error("Query Error:", error);
      },
    },
  });
};

export const useGetActiveBuyers = () => {
  return useQuery<ApiResponse<ApiResponseItem>, unknown>({
    queryKey: ["buyers"],
    queryFn: async (): Promise<ApiResponse<ApiResponseItem>> => {
      const response = await client.get<ApiResponse<ApiResponseItem>>(
        ENDPOINTS.Common.buyers,
        {
          headers: {
            Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
          },
        }
      );
      return response.data;
    },
    meta: {
      onError: (error: unknown) => {
        console.error("Query Error:", error);
      },
    },
  });
};

export const useGetActiveAuctionCategories = () => {
  return useQuery<ApiResponse<ApiResponseItem>, unknown>({
    queryKey: ["auctionCategories"],
    queryFn: async (): Promise<ApiResponse<ApiResponseItem>> => {
      const response = await client.get<ApiResponse<ApiResponseItem>>(
        ENDPOINTS.Common.auctionCategories,
        {
          headers: {
            Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
          },
        }
      );
      return response.data;
    },
    meta: {
      onError: (error: unknown) => {
        console.error("Query Error:", error);
      },
    },
  });
};

export const useGetAllActivePlants = () => {
  return useQuery<ApiResponse<ApiResponseItem>, unknown>({
    queryKey: ["plants"],
    queryFn: async (): Promise<ApiResponse<ApiResponseItem>> => {
      const response = await client.get<ApiResponse<ApiResponseItem>>(
        ENDPOINTS.Common.plants,
        {
          headers: {
            Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
          },
        }
      );
      return response.data;
    },
    meta: {
      onError: (error: unknown) => {
        console.error("Query Error:", error);
      },
    },
  });
};