import { useQuery } from "@tanstack/react-query";
import ENDPOINTS from "../../services/ENDPOINTS";
import client from "../../services/axiosClient";
import { getLocalItem } from "../../Utils/Helpers";
import { LOCAL_STORAGE_KEYS } from "../../Utils/Helpers";
import type {
  CategoriesListResponse,
  CityResponse,
  countryResData,
  ManufacturerRes,
  masterCountResponce,
  MaterialGroup,
  StateResponse,
} from "../../Typings/MasterApiTypes";

export const useGetMasterCountApi = () => {
    return useQuery<masterCountResponce>({
      queryKey: ["MasterCount"],
      queryFn: async (): Promise<masterCountResponce> => {
        const res = await client.get<masterCountResponce>(
          ENDPOINTS.Common.count,
          {
            headers: {
              Authorization: `Bearer ${getLocalItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
            },
          }
        );
        return res.data; // ✅ return data, not AxiosResponse
      },
      meta: {
        onError: (error: unknown) => {
          console.error("Query Error:", error);
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
  return useQuery<countryResData['data']>({
    queryKey: ["CountryName"],
    queryFn: async (): Promise<countryResData['data']> => {
      const res = await client.get<countryResData>(
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
    queryKey: ["BrandName"],
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
    queryKey: ["GenericName"],
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
  return useQuery<unknown[]>({
    queryKey: ["BusinessDepartments"],
    queryFn: async (): Promise<unknown[]> => {
      const res = await client.get<{ data: unknown[] }>(
        ENDPOINTS.Common.BusinessDepartment,
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
export const useGetActiveBuyers = () => {
  return useQuery<unknown[]>({
    queryKey: ["Buyers"],
    queryFn: async (): Promise<unknown[]> => {
      const res = await client.get<{ data: unknown[] }>(
        ENDPOINTS.Common.buyers,
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
export const useGetActiveCategories = () => {
  return useQuery<unknown[]>({
    queryKey: ["Categories"],
    queryFn: async (): Promise<unknown[]> => {
      const res = await client.get<{ data: unknown[] }>(
        ENDPOINTS.Common.categories,
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

export const useGetActiveAuctionCategories = () => {
  return useQuery<unknown[]>({
    queryKey: ["AuctionCategories"],
    queryFn: async (): Promise<unknown[]> => {
      const res = await client.get<{ data: unknown[] }>(
        ENDPOINTS.Common.auctionCategories,
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

export const useGetActivePaymentTerms = () => {
  return useQuery<unknown[]>({
    queryKey: ["PaymentTerms"],
    queryFn: async (): Promise<unknown[]> => {
      const res = await client.get<{ data: unknown[] }>(
        ENDPOINTS.Common.paymentTerms,
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

export const useGetMaterialGroupList = () => {
  return useQuery<MaterialGroup['data']>({
    queryKey: ["MaterialGroupList"],
    queryFn: async (): Promise<MaterialGroup['data']> => {
      const res = await client.get<MaterialGroup>(
        ENDPOINTS.Common.materialGroup,
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

export const useGetCategoriesListByMaterialGroupId = (id: string) => {
  return useQuery<CategoriesListResponse['data']>({
    queryKey: ["categoryListById", id],
    queryFn: async (): Promise<CategoriesListResponse['data']> => {
      const res = await client.get<CategoriesListResponse>(
        `${ENDPOINTS.Common.categories}/${id}`,
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

export const useGetAllActiveCompanyCodes = () => {
  return useQuery<unknown[]>({
    queryKey: ["company-codes"],
    queryFn: async (): Promise<unknown[]> => {
      const res = await client.get<{ data: unknown[] }>(
        ENDPOINTS.Common.companyCodes,
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

export const useGetAllActiveMaterialTypes = () => {
  return useQuery<unknown[]>({
    queryKey: ["materialTypes"],
    queryFn: async (): Promise<unknown[]> => {
      const res = await client.get<{ data: unknown[] }>(
        ENDPOINTS.Common.materialTypes,
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

export const useGetAllActiveManufacturers = () => {
  return useQuery<ManufacturerRes['data']>({
    queryKey: ["manufacturers"],
    queryFn: async (): Promise<ManufacturerRes['data']> => {
      const res = await client.get<ManufacturerRes>(
        ENDPOINTS.Common.Manufacturer,
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


export const useGetAllActivePermissions = () => {
  return useQuery<unknown[]>({
    queryKey: ["permission"],
    queryFn: async (): Promise<unknown[]> => {
      const res = await client.get<{ data: unknown[] }>(
        ENDPOINTS.Common.permission,
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

export const useGetAllActiveGeneralLedgerAccounts = () => {
  return useQuery<unknown[]>({
    queryKey: ["generalLedgerAccount"],
    queryFn: async (): Promise<unknown[]> => {
      const res = await client.get<{ data: unknown[] }>(
        ENDPOINTS.Common.GeneralLedgerAccount,
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

export const useGetAllActivePlants = () => {
  return useQuery<unknown[]>({
    queryKey: ["plants"],
    queryFn: async (): Promise<unknown[]> => {
      const res = await client.get<{ data: unknown[] }>(
        ENDPOINTS.Common.plants,
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