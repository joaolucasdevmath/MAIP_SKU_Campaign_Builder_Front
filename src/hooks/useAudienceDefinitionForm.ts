import type {
  SegmentationValue,
  AudienceBackendField,
  DynamicAudienceFormValues,
} from 'src/types/audienceDefinitionFormTypes';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import axiosInstance, { endpoints } from 'src/utils/axios';
import { audienceDefinitionSchema } from 'src/utils/schemas/audienceDefinitionSchema';

import { useFormWizard } from 'src/context/FormWizardContext';

export function useAudienceDefinitionForm(state: Partial<DynamicAudienceFormValues>) {
  const [fields, setFields] = useState<AudienceBackendField[]>([]);
  const [segmentationOptions, setSegmentationOptions] = useState<SegmentationValue[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSegmentation, setLoadingSegmentation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { updateCampaignData } = useFormWizard();
  const router = useRouter();

  const form = useForm<DynamicAudienceFormValues>({
    resolver: zodResolver(audienceDefinitionSchema),
    defaultValues: {
      source_base: state.source_base || '',
      segmentation: state.segmentation || [],
    },
    mode: 'onSubmit',
  });

  // Watch para observar mudanças no campo source_base
  const selectedSourceBase = form.watch('source_base');

  useEffect(() => {
    const loadBackendData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axiosInstance.get(endpoints.briefing.step2);

        if (res.data.success && Array.isArray(res.data.data)) {
          setFields(res.data.data);
        } else {
          setError(res.data.errorMessage || 'Erro ao carregar campos do backend.');
        }
      } catch (err) {
        console.error('Erro ao carregar dados step2:', err);
        setError('Erro ao conectar ao backend.');
      } finally {
        setLoading(false);
      }
    };

    loadBackendData();
  }, []);

  // Carregar segmentações quando source_base mudar
  useEffect(() => {
    if (selectedSourceBase) {
      const loadSegmentations = async () => {
        setLoadingSegmentation(true);
        try {
          // Buscar o ID da source_base selecionada
          const sourceBaseField = fields.find((f) => f.name === 'source_base');
          const selectedOption = sourceBaseField?.values?.find(
            (item) => item.value === selectedSourceBase
          );

          if (selectedOption?.ids) {
            const endpoint = endpoints.briefing.step2Segment(selectedOption.ids.toString());

            const res = await axiosInstance.get(endpoint);

            if (res.data.success && Array.isArray(res.data.data)) {
              const segmentationField = res.data.data.find(
                (field: any) => field.name === 'segmentation'
              );
              if (segmentationField && segmentationField.values) {
                setSegmentationOptions(segmentationField.values);
              } else {
                setSegmentationOptions([]);
              }
            } else {
              console.error('Erro na resposta da API de segmentação:', res.data);
            }
          } else {
            console.error('ID não encontrado para a base selecionada');
          }
        } catch (err) {
          console.error('Erro ao carregar segmentações:', err);
        } finally {
          setLoadingSegmentation(false);
        }
      };

      loadSegmentations();
    } else {
      setSegmentationOptions([]);
    }
  }, [selectedSourceBase, fields]);

  const onSubmit = (data: DynamicAudienceFormValues) => {
    updateCampaignData(data);
  };

  const handleNext = async (data: DynamicAudienceFormValues) => {
    
    const sourceBaseField = fields.find((f) => f.name === 'source_base');
    const selectedOption = sourceBaseField?.values?.find(
      (item) => item.value === data.source_base
    );

    
    const dataToSave = {
      ...data,
      source_base_id: selectedOption?.ids?.toString() || '',
      base_origin: data.source_base ? [data.source_base] : [],
    };

    console.log('Dados salvos no step 2:', dataToSave);
    updateCampaignData(dataToSave);
    router.push('/briefing/advanced-filter'); // próxima rota
  };

  const handlePrevious = () => {
    router.push('/briefing/basic-info');
  };

  // Buscar campos específicos do backend
  const sourceBaseField = fields.find((f) => f.name === 'source_base');

  return {
    ...form,
    fields,
    segmentationOptions,
    loading,
    loadingSegmentation,
    error,
    onSubmit,
    handleNext,
    handlePrevious,
    selectedSourceBase,
    sourceBaseField,
  };
}
