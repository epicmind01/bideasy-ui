// src/api/useAuth.ts
import { useState } from "react";
import client from "../../services/axiosClient";
import type { User, LoginResponse, UserResponse } from "../../Typings/LoginApiTypes";
import ENDPOINTS from "../../services/ENDPOINTS";
import { useQuery } from "@tanstack/react-query";
import { getLocalItem, LOCAL_STORAGE_KEYS } from "../../utils/Helpers";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await client.post<LoginResponse>(ENDPOINTS.buyerSignIn, {
      email,
      password,
    });

    localStorage.setItem("token", data.token);
    setUser(data.user);

    return data;
  };

  const logout = (): void => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const getToken = (): string | null => localStorage.getItem("token");

  const isAuthenticated = (): boolean => !!getToken();

  return { user, login, logout, getToken, isAuthenticated };
}



export const getUserProfile = () => {
  return useQuery<UserResponse>({
    queryKey: ["auctionList"],
    queryFn: async (): Promise<UserResponse> => {
      try {
        const token = getLocalItem(LOCAL_STORAGE_KEYS.TOKEN);       
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await client.get<UserResponse>(
          ENDPOINTS.getBuyerProfile,
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
