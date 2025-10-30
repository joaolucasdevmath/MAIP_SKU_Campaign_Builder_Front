// src/hooks/useAdvancedFilterForm.ts
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import axiosInstance, { endpoints } from 'src/utils/axios';
import { advancedFilterSchema } from 'src/utils/schemas/advancedFilterSchema';

import { useFormWizard } from 'src/context/FormWizardContext';

import { Field } from 'src/components/hook-form';

export interface AdvancedFilterBackendField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'dropdown' | 'range' | 'checkbox';
  values?: { label: string; value: string }[];
  required?: boolean;
  multiple?: boolean;
  placeholder?: string;
}

export interface DynamicAdvancedFilterFormValues {
  criterios_saida: string;
  [key: string]: any;
}

/* ---------- MAPEAMENTO DE COMPONENTES ---------- */
export function getAdvancedFieldComponent(field: AdvancedFilterBackendField): React.FC<any> | null {
  console.log('Mapping component for field:', field);

  // Se for range, retorna null pois é tratado especialmente
  if (field.type === 'range') {
    return null;
  }

  // Se for checkbox com valores, trata como multiselect
  if (field.type === 'checkbox' && field.values && field.values.length > 0) {
    return Field.MultiSelect;
  }

  // Se for checkbox simples (boolean), retorna Checkbox
  if (field.type === 'checkbox' || field.type === 'boolean') {
    return Field.Checkbox;
  }

  // Se for dropdown, verifica se é múltiplo ou simples
  if (field.type === 'dropdown') {
    return field.multiple ? Field.MultiSelect : Field.Select;
  }

  // Outros tipos
  const typeMap: Record<string, React.FC<any>> = {
    text: Field.Text,
    number: Field.Text
  };

  return typeMap[field.type] || Field.Text;
}
/* ---------- HOOK ---------- */
export function useAdvancedFilterForm(state: Partial<DynamicAdvancedFilterFormValues> = {}) {
  const [fields, setFields] = useState<AdvancedFilterBackendField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { state: wizardState, updateCampaignData } = useFormWizard();
  const router = useRouter();

  const form = useForm<DynamicAdvancedFilterFormValues>({
    resolver: zodResolver(advancedFilterSchema),
    defaultValues: {
      criterios_saida: state.criterios_saida || '',
    },
    mode: 'onSubmit',
  });

  /* ---------- CARREGA CAMPOS DA API ---------- */
  useEffect(() => {
    const load = async () => {
      const sourceBaseId = wizardState.source_base_id;
      if (!sourceBaseId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await axiosInstance.get(endpoints.briefing.step3Segment(sourceBaseId));
        console.log('Advanced Filter API Response:', res.data);
        if (res.data.success && Array.isArray(res.data.data)) {
          const apiFields = res.data.data as AdvancedFilterBackendField[];

          // Normaliza campos (sem lógica por name)
          const normalized = apiFields.map((f) => ({
            ...f,
            type: f.type || 'text',
            multiple: f.multiple || false,
            required: f.required || false,
            values: Array.isArray(f.values) ? f.values : [],
          }));

          setFields(normalized);

          // defaultValues dinâmicos
          const dynamicDefaults = Object.fromEntries(
            normalized.map((f) => [
              f.name,
              state[f.name] ??
                (f.multiple ? [] : f.type === 'boolean' ? false : f.type === 'number' ? '' : ''),
            ])
          );

          // Reset form apenas uma vez após carregar os campos
          form.reset({ 
            ...form.getValues(),
            ...dynamicDefaults,
            criterios_saida: state.criterios_saida || '' 
          });
        } else {
          setError('Erro ao carregar filtros.');
        }
      } catch (err: any) {
        setError('Erro de conexão com o backend.');
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardState.source_base_id]); 

  const onSubmit = (data: DynamicAdvancedFilterFormValues) => {
    // Transforma objetos para valores simples
    const transformed = { ...data };
    fields.forEach((f) => {
      if (f.type === 'dropdown' && Array.isArray(transformed[f.name])) {
        transformed[f.name] = transformed[f.name].map((item: any) =>
          typeof item === 'object' && item.value ? item.value : item
        );
      }
    });
    updateCampaignData(transformed);
  };

  const handleSubmitWithValidation = () => form.handleSubmit(
      (data) => {
        onSubmit(data);
        router.push('/briefing/review-generation');
      },
      () => {
        setTimeout(() => {
          const el = document.querySelector('[data-testid="error-container"]');
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    )();

  const handlePrevious = () => router.push('/briefing/audience-definition');

  return {
    ...form,
    fields,
    loading,
    error,
    onSubmit,
    handleSubmitWithValidation,
    handlePrevious,
    getAdvancedFieldComponent,
    
  };
}