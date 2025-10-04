import ENDPOINTS from "../../services/ENDPOINTS";
import type { 
  RFQListResponse, 
  RFQStats, 
  RFQListParams,
  RFQDetails,
  VendorOffer,
  RFQRound,
  ComparisonData,
  CreateRFQData,
  CreateRoundData,
  UpdateRoundData,
  CounterOfferData,
  ArcApprovalData
} from "../../Typings/RFQTypes";
import { getLocalItem } from "../../Utils/Helpers";
import { LOCAL_STORAGE_KEYS } from "../../Utils/Helpers";
import { useMutation, useQuery } from "@tanstack/react-query";
import client from "../../services/axiosClient";

export const useGetRFQListApi = (params?: RFQListParams) => {
  return useQuery<RFQListResponse>({
    queryKey: ["rfqList", params],
    queryFn: async (): Promise<RFQListResponse> => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get<RFQListResponse>(
          ENDPOINTS.rfqEventList,
          {
            params: {
              page: params?.page,
              limit: params?.pageSize,
              search: params?.search,
              status: params?.status,
              startDate: params?.startDate,
              endDate: params?.endDate,
              category: params?.category,
              minAmount: params?.minAmount,
              maxAmount: params?.maxAmount,
              statusArr: params?.statusArr,
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

export const useGetRFQStatsApi = (params?: Omit<RFQListParams, 'page' | 'pageSize'>) => {
  return useQuery<RFQStats>({
    queryKey: ["rfqStats", params],
    queryFn: async (): Promise<RFQStats> => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get<RFQStats>(
          ENDPOINTS.rfqEventList + '/stats',
          {
            params: {
              search: params?.search,
              status: params?.status,
              startDate: params?.startDate,
              endDate: params?.endDate,
              category: params?.category,
              minAmount: params?.minAmount,
              maxAmount: params?.maxAmount,
              statusArr: params?.statusArr,
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

export const useDeleteRFQApi = () => {
  return useMutation({
    mutationFn: (rfqEventId: string) => 
      client.delete(`${ENDPOINTS.deleteRfqEvent}`, {
        data: { rfqEventId }
      }),
  });
};

export const useCloneRFQApi = () => {
  return useMutation({
    mutationFn: (rfqEventId: string) => 
      client.post(ENDPOINTS.cloneRfqEvent, { rfqEventId }),
  });
};

export const useExportRFQApi = () => {
  return useMutation({
    mutationFn: (params: RFQListParams) => {
     const query = new URLSearchParams(params as Record<string, string>).toString();
      return client.get(`${ENDPOINTS.exportRfqEvent}?${query}`, {
        responseType: 'blob',
      });
    },
  });
};

export const useCreateRFQApi = () => {
  return useMutation({
    mutationFn: (data: any) => {
      const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("No authentication token found");
      }

      return client.post(ENDPOINTS.createRfqEvent, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useUpdateRFQApi = () => {
  return useMutation({
    mutationFn: ({ rfqEventId, data }: { rfqEventId: string; data: any }) => {
      const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("No authentication token found");
      }

      return client.put(`${ENDPOINTS.updateRfqEvent}/${rfqEventId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useGetRFQByIdApi = (rfqEventId: string) => {
  return useQuery({
    queryKey: ["rfqDetails", rfqEventId],
    queryFn: async () => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get(`${ENDPOINTS.rfqEventbyId}/${rfqEventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.data) {
          throw new Error("No data received from server");
        }
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    enabled: !!rfqEventId,
    meta: {
      onError: (error: unknown) => {
        console.error("Query Error in meta:", error);
      },
    },
  });
};

// New API hooks for RFQ view, comparison, and rounds
export const useGetRFQDetailsApi = (rfqId: string) => {
  return useQuery<RFQDetails>({
    queryKey: ["rfqDetails", rfqId],
    queryFn: async (): Promise<RFQDetails> => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get(`${ENDPOINTS.rfqEventbyId}/${rfqId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.data) {
          throw new Error("No data received from server");
        }
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    enabled: !!rfqId,
  });
};

export const useGetRFQVendorOffersApi = (rfqId: string) => {
  return useQuery<VendorOffer[]>({
    queryKey: ["rfqVendorOffers", rfqId],
    queryFn: async (): Promise<VendorOffer[]> => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get(`${ENDPOINTS.rfqEventbyId}/${rfqId}/vendor-offers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.data) {
          throw new Error("No data received from server");
        }
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    enabled: !!rfqId,
  });
};

export const useGetRFQCollaboratorsApi = (rfqId: string) => {
  return useQuery<any[]>({
    queryKey: ["rfqCollaborators", rfqId],
    queryFn: async (): Promise<any[]> => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get(`${ENDPOINTS.rfqEventbyId}/${rfqId}/collaborators`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.data) {
          throw new Error("No data received from server");
        }
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    enabled: !!rfqId,
  });
};

export const useGetRFQComparisonDataApi = (rfqId: string) => {
  return useQuery<ComparisonData>({
    queryKey: ["rfqComparison", rfqId],
    queryFn: async (): Promise<ComparisonData> => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get(`${ENDPOINTS.rfqEventbyId}/${rfqId}/comparison`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.data) {
          throw new Error("No data received from server");
        }
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    enabled: !!rfqId,
  });
};

export const useGetRFQItemsApi = (rfqId: string) => {
  return useQuery<any>({
    queryKey: ["rfqItems", rfqId],
    queryFn: async (): Promise<any> => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get(`${ENDPOINTS.rfqEventbyId}/${rfqId}/items`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.data) {
          throw new Error("No data received from server");
        }
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    enabled: !!rfqId,
  });
};

// RFQ Rounds API hooks
export const useGetRFQRoundsApi = (rfqId: string) => {
  return useQuery<RFQRound[]>({
    queryKey: ["rfqRounds", rfqId],
    queryFn: async (): Promise<RFQRound[]> => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get(`${ENDPOINTS.rfqEventbyId}/${rfqId}/rounds`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.data) {
          throw new Error("No data received from server");
        }
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    enabled: !!rfqId,
  });
};

export const useGetRFQRoundDetailsApi = (roundId: string) => {
  return useQuery<RFQRound>({
    queryKey: ["rfqRoundDetails", roundId],
    queryFn: async (): Promise<RFQRound> => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get(`${ENDPOINTS.rfqEventbyId}/rounds/${roundId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.data) {
          throw new Error("No data received from server");
        }
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    enabled: !!roundId,
  });
};

export const useGetRFQRoundVendorsApi = (roundId: string) => {
  return useQuery<VendorOffer[]>({
    queryKey: ["rfqRoundVendors", roundId],
    queryFn: async (): Promise<VendorOffer[]> => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get(`${ENDPOINTS.rfqEventbyId}/rounds/${roundId}/vendors`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.data) {
          throw new Error("No data received from server");
        }
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    enabled: !!roundId,
  });
};

export const useCreateRFQRoundApi = () => {
  return useMutation({
    mutationFn: (data: CreateRoundData) => {
      const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("No authentication token found");
      }

      return client.post(`${ENDPOINTS.rfqEventbyId}/${data.rfqId}/rounds`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useUpdateRFQRoundApi = () => {
  return useMutation({
    mutationFn: (data: UpdateRoundData) => {
      const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("No authentication token found");
      }

      return client.put(`${ENDPOINTS.rfqEventbyId}/rounds/${data.roundId}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useCloseRFQRoundApi = () => {
  return useMutation({
    mutationFn: (roundId: string) => {
      const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("No authentication token found");
      }

      return client.post(`${ENDPOINTS.rfqEventbyId}/rounds/${roundId}/close`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

// Counter Offer and ARC Approval API hooks
export const useAddCounterOfferApi = () => {
  return useMutation({
    mutationFn: (data: CounterOfferData) => {
      const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("No authentication token found");
      }

      return client.post(`${ENDPOINTS.rfqEventbyId}/${data.rfqEventId}/counter-offer`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useAddToArcApprovalApi = () => {
  return useMutation({
    mutationFn: (data: ArcApprovalData[]) => {
      const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("No authentication token found");
      }

      return client.post(`${ENDPOINTS.rfqEventbyId}/arc-approval`, { items: data }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

// Additional missing API hooks from bideasy_buyer
export const useGetTopVendorOffersByGenericId = () => {
  return useMutation({
    mutationFn: (payload: { rfqEventId: string; genericIds: string[]; top?: string }) => {
      const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("No authentication token found");
      }

      return client.post(`${ENDPOINTS.getTopVendorOffers}?rfqEventId=${payload.rfqEventId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useAddRfqReviseOfferApi = () => {
  return useMutation({
    mutationFn: (payload: any) => {
      const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("No authentication token found");
      }

      return client.post(ENDPOINTS.rfqEventreviseOffer, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useAddRfqCollectiveReviseOfferApi = () => {
  return useMutation({
    mutationFn: (payload: any) => {
      const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("No authentication token found");
      }

      return client.post(ENDPOINTS.rfqEventcollectivereviseOffer, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useApproveRfqReviseOfferApi = () => {
  return useMutation({
    mutationFn: (payload: any) => {
      const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("No authentication token found");
      }

      return client.post(ENDPOINTS.rfqStatusOffer, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useGetRfqEventItemsByRfqIdQuery = (rfqId: string, searchObj?: Record<string, any>) => {
  return useQuery({
    queryKey: ["rfqEventItems", rfqId, searchObj],
    queryFn: async () => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const query = new URLSearchParams();
        if (searchObj) {
          Object.entries(searchObj).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              value.forEach((val) => query.append(`${key}[]`, String(val)));
            } else if (value !== undefined && value !== null) {
              query.append(key, String(value));
            }
          });
        }

        const response = await client.get(`${ENDPOINTS.rfqEventbyId}/${rfqId}/items?${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.data) {
          throw new Error("No data received from server");
        }
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    enabled: !!rfqId,
  });
};

export const useGetRfqEventVendorOffersVendorDetails = (rfqId: string, vendorId: string) => {
  return useQuery({
    queryKey: ["rfqVendorOffersDetails", rfqId, vendorId],
    queryFn: async () => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get(`${ENDPOINTS.rfqEventbyId}/${rfqId}/vendor/${vendorId}/offers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.data) {
          throw new Error("No data received from server");
        }
        return response.data;
      } catch (error) {
        console.error("API Error:", error);
        throw error;
      }
    },
    enabled: !!rfqId && !!vendorId,
  });
};

// ARC Reports API hooks
export const useArcReportsActionApi = () => {
  return useMutation({
    mutationFn: (payload: any) => {
      const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("No authentication token found");
      }

      return client.post(ENDPOINTS.arcReportsAction, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useCollectiveArcReportsActionApi = () => {
  return useMutation({
    mutationFn: (payload: any) => {
      const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("No authentication token found");
      }

      return client.post(ENDPOINTS.collectiveArcReportsAction, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useApproveOrRejectArcReportsApi = () => {
  return useMutation({
    mutationFn: (payload: any) => {
      const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("No authentication token found");
      }

      return client.post(ENDPOINTS.approveArcReport, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useArcReportsDeleteApi = () => {
  return useMutation({
    mutationFn: (arcReportId: string) => {
      const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) {
        throw new Error("No authentication token found");
      }

      return client.delete(`${ENDPOINTS.arcReportsDelete}/${arcReportId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};
