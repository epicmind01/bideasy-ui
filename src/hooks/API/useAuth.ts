// src/api/useAuth.ts
import { useState } from "react";
import client from "../../services/axiosClient";
import type { User, LoginResponse } from "../../Typings/LoginApiTypes";
import ENDPOINTS from "../../services/ENDPOINTS";

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
