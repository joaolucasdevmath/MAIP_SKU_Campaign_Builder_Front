import { useState, useEffect } from 'react';

import axiosInstance, { endpoints } from 'src/utils/axios';

export interface Template {
  id: string;
  campaign_name: string;

  description: string;
  status: string;
  offer: string;
  code: string;
  channels: string;
  created_at: string;
}

interface ApiResponse {
  success: boolean;
  errorMessage?: string;
  code: number;
  data: Template[];
}

export function useArchive() {
  const [data, setData] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(endpoints.briefing.archive);
        console.log('HISTORICO response:', response.data);
        const json: ApiResponse = response.data;
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.errorMessage || 'Erro desconhecido');
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao buscar dados');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const buildArchivePayload = ({
    campaignCore,
    channels,
    briefingCore,
    briefingFields,
  }: {
    campaignCore: {
      id?: string;
      offer: string;
      code: string;
      campaign_name: string;
      campaign_type: string;
      campaign_objective: string;
      start_date: string;
      end_date: string;
      segmentation_sql: string;
      audience_snapshot: number;
      status: string;
      is_template: boolean;
    };
    channels: Array<{ id: number; quantity: number }>;
    briefingCore: {
      name: string;
      segmentation: string;
      source_base_id: string;
      source_base: string;
    };
    briefingFields: Array<{ name: string; value: string }>;
  }) => ({
    campaign: {
      core: campaignCore,
      channels,
    },
    briefing: {
      core: briefingCore,
      fields: briefingFields,
    },
  });

  const saveArchive = async (payload: any) => {
    try {
      console.log('Payload enviado para /api/archive/:', payload);
      const response = await axiosInstance.post(endpoints.briefing.archiveSave, payload);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar dados');
      throw err;
    }
  };

  const updateArchiveStatus = async (payload: any, status: string) => {
    const updatedPayload = {
      ...payload,
      campaign: {
        ...payload.campaign,
        core: {
          ...payload.campaign.core,
          status,
        },
      },
    };
    const response = await axiosInstance.post(endpoints.briefing.archiveSave, updatedPayload);
    return response.data;
  };

  // Buscar dados de um archive específico pelo id
  const getArchiveById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(endpoints.briefing.archiveId(id));

      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar dados do archive');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    saveArchive,
    buildArchivePayload,
    updateArchiveStatus,
    getArchiveById,
  };
}
