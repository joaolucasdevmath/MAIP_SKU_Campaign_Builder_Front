import { useState } from 'react';

import axiosInstance, { endpoints } from 'src/utils/axios';

export interface BackendAuthResponse {
  success: boolean;
  data?: any;
  errorMessage?: string;
  code: number;
}

export function useBackendAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BackendAuthResponse | null>(null);

  const authenticate = async (token: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await axiosInstance.post(
        endpoints.briefing.loginAzure,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = res.data;
      setData(json);
      if (!json.success) {
        setError(json.errorMessage || 'Erro desconhecido');
      }
      return json;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { authenticate, loading, error, data };
}
