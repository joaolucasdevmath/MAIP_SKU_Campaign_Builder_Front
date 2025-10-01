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
  const [isInitialized, setIsInitialized] = useState(false);

  const { state: formWizardState, updateCampaignData } = useFormWizard();
  const router = useRouter();

  const form = useForm<DynamicAdvancedFilterFormValues>({
    resolver: zodResolver(advancedFilterSchema),
    defaultValues: {
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
      if (!sourceBaseId || isInitialized) return;

      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(endpoints.briefing.step3Segment(sourceBaseId));
        console.log('Dados brutos do backend:', res.data); 
        if (res.data.success && Array.isArray(res.data.data)) {
          const dynamicFields = res.data.data
            .map((field: any) => {
              console.log('Processando campo:', field); 
              if (field.name === 'nivel_escolaridade' && Array.isArray(field.values)) {
                // Mapear nivel_escolaridade como checkboxes
                return field.values.map((option: any) => ({
                  name: `nivel_escolaridade_${option.value.toLowerCase().replace(/\s+/g, '_')}`,
                  label: option.label || option.value,
                  type: 'boolean',
                  required: false,
                }));
              }
              if (field.name === 'status_vestibular') {
                return {
                  ...field,
                  type: 'dropdown',
                  multiple: true,
                  values: field.values || [],
                };
              }
              if (field.name === 'forma_entrada') {
                return {
                  ...field,
                  type: 'dropdown',
                  values: field.values || [{ value: 'Nota Enem', label: 'Nota Enem' }],
                };
              }
              if (field.name === 'nom_tipo_curso' && Array.isArray(field.values)) {
                
                return field.values.map((option: any) => ({
                  name: `nom_tipo_curso_${option.value.toLowerCase().replace(/\s+/g, '_')}`,
                  label: option.label || option.value,
                  type: 'boolean',
                  required: false,
                }));
              }
              if (
                (field.name === 'tipo_captacao' ||
                  field.name === 'forma_ingresso' ||
                  field.name === 'status_prova') &&
                Array.isArray(field.values)
              ) {
                return field.values.map((option: any) => {
                  let name = '';
                  if (field.name === 'status_prova') {
                    name = `status_prova_${option.value.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
                  } else if (option.value === 'ENEM') name = 'forma_ingresso_enem';
                  else if (option.value === 'TRANSF. EXTERNA')
                    name = 'forma_ingresso_transferencia_externa';
                  else if (option.value === 'Vestibular') name = 'forma_ingresso_vestibular';
                  else if (option.value === 'VESTIBULAR (INGRESSO SIMPLIFICADO)')
                    name = 'forma_ingresso_ingresso_simplificado';
                  else name = `${field.name}_${option.value.toLowerCase().replace(/\s+/g, '_')}`;
                  return {
                    name,
                    label: option.label || option.value,
                    type: 'boolean',
                    required: false,
                  };
                });
              }
              return {
                ...field,
                label: field.label || field.name.charAt(0).toUpperCase() + field.name.slice(1),
                type: field.type || 'text',
                values:
                  field.values?.filter(
                    (option: any, index: number, array: any[]) =>
                      array.findIndex((item: any) => item.value === option.value) === index
                  ) || [],
              };
            })
            .flat()
            .filter((field: any) => field !== null);

          console.log('Campos dinâmicos gerados:', dynamicFields);
          setFields(dynamicFields);

          const initialDynamicValues = Object.fromEntries(
            // @ts-ignore
            dynamicFields.map((field) => [
              field.name,
              state[field.name] ||
                (field.type === 'dropdown' && field.multiple
                  ? []
                  : field.type === 'boolean'
                    ? false
                    : ''),
            ])
          );
          form.reset({
            ...form.getValues(), 
            ...initialDynamicValues,
            outras_exclusoes: state.outras_exclusoes || '',
            criterios_saida: state.criterios_saida || '',
            disponibilizacao_call_center_sim: state.disponibilizacao_call_center_sim || false,
            disponibilizacao_call_center_nao: state.disponibilizacao_call_center_nao || false,
            informacoes_extras: state.informacoes_extras || '',
          });
        } else {
          setError(res.data.errorMessage || 'Erro ao carregar campos do backend.');
        }
      } catch (err) {
        setError('Erro ao conectar ao backend. Verifique se a API está rodando.');
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    loadBackendData();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },  [formWizardState.source_base_id, form.reset, form.getValues, state, isInitialized]);

  const transformFormData = (formValues: DynamicAdvancedFilterFormValues) => {
    const transformed = { ...formValues };
    fields.forEach((field) => {
      if (field.type === 'dropdown' && Array.isArray(transformed[field.name])) {
        transformed[field.name] = transformed[field.name].map((item: any) =>
          typeof item === 'object' && item.value ? item.value : item
        );
        if (field.name === 'status_vestibular') {
          // @ts-ignore
          transformed[field.name] = transformed[field.name].join(',');
        }
      }
    });
    return transformed;
  };

  const onSubmit = (data: DynamicAdvancedFilterFormValues) => {
    const transformedData = transformFormData(data);
    // @ts-ignore
    updateCampaignData(transformedData);
  };

  const handleSubmitWithValidation = () => {
    const rawValues = form.getValues();
    const transformedValues = transformFormData(rawValues);
    Object.entries(transformedValues).forEach(([key, value]) => {
      // @ts-ignore
      form.setValue(key as keyof DynamicAdvancedFilterFormValues, value);
    });
    return form.handleSubmit(
      (formValues) => {
        onSubmit(formValues);
        router.push('/briefing/review-generation');
      },
      (errors) => {
        console.error('Erros de validação:', errors);
        scrollToErrors();
      }
    )();
  };

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
    handleSubmitWithValidation,
    handlePrevious,
  };
}