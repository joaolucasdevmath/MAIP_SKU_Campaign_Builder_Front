import { useState } from "react";

import axiosInstance, { endpoints } from 'src/utils/axios';

export interface BasicAuthResponse {
  success: boolean;
  data?: {
    token: string;
  };
  errorMessage?: string;
  code: number;
}

export interface BasicAuthCredentials {
  email: string;
  password: string;
}

export function useBasicAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BasicAuthResponse | null>(null);

  const login = async (credentials: BasicAuthCredentials): Promise<BasicAuthResponse | null> => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const basicAuth = btoa(`${credentials.email}:${credentials.password}`);
      const res = await axiosInstance.post(endpoints.briefing.loginBasic, {}, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${basicAuth}`
        },
        
        transformRequest: [(requestData, headers) => {
          headers.set('Authorization', `Basic ${basicAuth}`);
          return requestData;
        }],
      });
      const json: BasicAuthResponse = res.data;
      setData(json);
      if (!json.success) {
        setError(json.errorMessage || "Erro de autenticação");
      }
      return json;
    } catch (e: any) {
      const errorMessage = e.message || "Erro de conexão";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return { 
    login, 
    loading, 
    error, 
    data, 
    clearError 
  };
}