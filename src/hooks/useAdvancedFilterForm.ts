import type {
  AdvancedFilterBackendField,
  DynamicAdvancedFilterFormValues,
} from 'src/types/advancedFilterFormTypes';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import axiosInstance, { endpoints } from 'src/utils/axios';
import { advancedFilterSchema } from 'src/utils/schemas/advancedFilterSchema';

import { useFormWizard } from 'src/context/FormWizardContext';

export function useAdvancedFilterForm(state: Partial<DynamicAdvancedFilterFormValues>) {
  const [fields, setFields] = useState<AdvancedFilterBackendField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { state: formWizardState, updateCampaignData } = useFormWizard();
  const router = useRouter();

  const form = useForm<DynamicAdvancedFilterFormValues>({
    resolver: zodResolver(advancedFilterSchema),
    defaultValues: {
      nom_grupo_marca: state.nom_grupo_marca || '',
      atl_niveldeensino__c: state.atl_niveldeensino__c || [],
      modalidade: state.modalidade || [],
      nom_curso: state.nom_curso || [],
      nom_curso_exclude: state.nom_curso_exclude || [],
      forma_ingresso_enem: state.forma_ingresso_enem || false,
      forma_ingresso_transferencia_externa: state.forma_ingresso_transferencia_externa || false,
      forma_ingresso_vestibular: state.forma_ingresso_vestibular || false,
      forma_ingresso_ingresso_simplificado: state.forma_ingresso_ingresso_simplificado || false,
      outras_exclusoes: state.outras_exclusoes || '',
      criterios_saida: state.criterios_saida || '',
      disponibilizacao_call_center_sim: state.disponibilizacao_call_center_sim || false,
      disponibilizacao_call_center_nao: state.disponibilizacao_call_center_nao || false,
      informacoes_extras: state.informacoes_extras || '',
    },
    mode: 'onSubmit',
  });

  useEffect(() => {
    const loadBackendData = async () => {
      const sourceBaseId = formWizardState.source_base_id;

      if (!sourceBaseId) {
        setError('ID da base de origem não encontrado. Volte ao step anterior.');
        return;
      }

      console.log('Source base ID do step2:', sourceBaseId);

      setLoading(true);
      setError(null);

      try {
        console.log(`Fazendo chamada para step3 com ID: ${sourceBaseId}`);
        const res = await axiosInstance.get(endpoints.briefing.step3Segment(sourceBaseId));
        console.log('Resposta da API step3:', res.data);

        if (res.data.success && Array.isArray(res.data.data)) {
          console.log('Campos recebidos:', res.data.data);

          const cleanedFields = res.data.data.map((field: any) => ({
            ...field,
            values: field.values
              ? field.values.filter(
                  (option: any, index: number, array: any[]) =>
                    array.findIndex((item: any) => item.value === option.value) === index
                )
              : [],
          }));

          setFields(cleanedFields);
        } else {
          setError(res.data.errorMessage || 'Erro ao carregar campos do backend.');
        }
      } catch (err) {
        console.error('Erro ao carregar dados step3:', err);
        setError('Erro ao conectar ao backend. Verifique se a API está rodando.');
      } finally {
        setLoading(false);
      }
    };

    loadBackendData();
  }, [formWizardState.source_base_id]);

  const onSubmit = (data: DynamicAdvancedFilterFormValues) => {
    const formattedData = {
      nom_grupo_marca: Array.isArray(data.nom_grupo_marca)
        ? data.nom_grupo_marca.join(',')
        : data.nom_grupo_marca,
      modalidade: data.modalidade,
      nom_curso: data.nom_curso,
      status_vestibular: Array.isArray(data.status_vestibular)
        ? data.status_vestibular.join(',')
        : data.status_vestibular,

      // Campos de forma de ingresso individuais
      forma_ingresso_enem: data.forma_ingresso_enem,
      forma_ingresso_transferencia_externa: data.forma_ingresso_transferencia_externa,
      forma_ingresso_vestibular: data.forma_ingresso_vestibular,
      forma_ingresso_ingresso_simplificado: data.forma_ingresso_ingresso_simplificado,
      atl_niveldeensino__c: data.atl_niveldeensino__c,
      nom_curso_exclude: data.nom_curso_exclude,
    };
    updateCampaignData(formattedData);
  };

  const transformFormData = (formValues: DynamicAdvancedFilterFormValues) => ({
    ...formValues,
    atl_niveldeensino__c: Array.isArray(formValues.atl_niveldeensino__c)
      ? formValues.atl_niveldeensino__c.map((item: any) => item.value || item)
      : formValues.atl_niveldeensino__c,
    modalidade: Array.isArray(formValues.modalidade)
      ? formValues.modalidade.map((item: any) => item.value || item)
      : formValues.modalidade,
    nom_curso: Array.isArray(formValues.nom_curso)
      ? formValues.nom_curso.map((item: any) => item.value || item)
      : formValues.nom_curso,
    nom_curso_exclude: Array.isArray(formValues.nom_curso_exclude)
      ? formValues.nom_curso_exclude.map((item: any) => item.value || item)
      : formValues.nom_curso_exclude,
  });

  const handleNext = async (data: DynamicAdvancedFilterFormValues) => {
    try {
      const transformedData = transformFormData(data);

      const formattedData = {
        nom_grupo_marca: Array.isArray(transformedData.nom_grupo_marca)
          ? transformedData.nom_grupo_marca.join(',')
          : transformedData.nom_grupo_marca,
        modalidade: transformedData.modalidade,
        nom_curso: transformedData.nom_curso,
        status_vestibular: Array.isArray(transformedData.status_vestibular)
          ? transformedData.status_vestibular.join(',')
          : transformedData.status_vestibular,

        forma_ingresso_enem: transformedData.forma_ingresso_enem,
        forma_ingresso_transferencia_externa: transformedData.forma_ingresso_transferencia_externa,
        forma_ingresso_vestibular: transformedData.forma_ingresso_vestibular,
        forma_ingresso_ingresso_simplificado: transformedData.forma_ingresso_ingresso_simplificado,
        atl_niveldeensino__c: transformedData.atl_niveldeensino__c,
        nom_curso_exclude: transformedData.nom_curso_exclude,
        outras_exclusoes: transformedData.outras_exclusoes,
        criterios_saida: transformedData.criterios_saida,
        disponibilizacao_call_center_sim: transformedData.disponibilizacao_call_center_sim,
        disponibilizacao_call_center_nao: transformedData.disponibilizacao_call_center_nao,
        informacoes_extras: transformedData.informacoes_extras,
      };

      updateCampaignData(formattedData);
      router.push('/briefing/review-generation');
    } catch (err) {
      console.error('Erro no handleNext:', err);
    }
  };

  const handleSubmitWithValidation = () =>
    form.handleSubmit(
      (formValues) => {
        handleNext(formValues);
      },
      (errors) => {
        console.log('Erros de validação:', errors);
        scrollToErrors();
      }
    );

  const handlePrevious = () => {
    router.push('/briefing/audience-definition');
  };

  const scrollToErrors = () => {
    setTimeout(() => {
      const errorElement = document.querySelector('[data-testid="error-container"]');
      if (errorElement) {
        errorElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 100);
  };

  return {
    ...form,
    fields,
    loading,
    error,
    onSubmit,
    handleNext,
    handlePrevious,
    scrollToErrors,
    handleSubmitWithValidation,
  };
}
