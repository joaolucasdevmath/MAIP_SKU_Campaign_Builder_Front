
import type { DynamicFormValues } from 'src/types/basicInfoFormTypes';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import axiosInstance, { endpoints } from 'src/utils/axios';
import { basicInfoSchema } from 'src/utils/schemas/basicInfoSchema';

import { useFormWizard } from 'src/context/FormWizardContext';

interface BackendField {
  name: string;
  label: string;
  type: string;
  values?: any[];
  required?: boolean;
  multiple?: boolean;
  has_subfield?: boolean;
  placeholder?: string;
}

export function useBasicInfoForm(state: Partial<DynamicFormValues>) {
  const [fields, setFields] = useState<BackendField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { updateCampaignData } = useFormWizard();
  const router = useRouter();

  const form = useForm<DynamicFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      // Campos estáticos
      campaign_name: state.campaign_name || '',
      start_date: state.start_date || null,
      end_date: state.end_date || null,
      is_continuous: state.is_continuous || false,
      // Campos dinâmicos serão inicializados depois
      campaign_objective: state.campaign_objective || [],
      campaign_type: state.campaign_type || [],
      channel: state.channel || [],
      offer: state.offer || '',
      campaign_codes: state.campaign_codes || '',
    },
    mode: 'onSubmit',
  });

  
  useEffect(() => {
    const loadBackendData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await axiosInstance.get(endpoints.briefing.step1);
        
        
        if (res.data.success && Array.isArray(res.data.data)) {
          setFields(res.data.data);
        } else {
          setError(res.data.errorMessage || 'Erro ao carregar campos do backend.');
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao conectar ao backend.');
      } finally {
        setLoading(false);
      }
    };

    loadBackendData();
  }, []);

  
  const onSubmit = (data: DynamicFormValues) => {
    updateCampaignData(data);
  };

  const handleNext = async (data: DynamicFormValues) => {
    updateCampaignData(data);
    router.push('/briefing/audience-definition');
  };

  
  const selectedChannels = form.watch('channel') || [];

  
  const campaignObjectiveField = fields.find((f) => f.name === 'campaign_objective');
  const campaignTypeField = fields.find((f) => f.name === 'campaign_type');
  const channelField = fields.find((f) => f.name === 'channel');
  const offerField = fields.find((f) => f.name === 'offer');
  const campaignCodesField = fields.find((f) => f.name === 'campaign_codes');

  return {
    ...form,
    fields,
    loading,
    error,
    onSubmit,
    handleNext,
    selectedChannels,
    campaignObjectiveField,
    campaignTypeField,
    channelField,
    offerField,
    campaignCodesField,
  };
}
