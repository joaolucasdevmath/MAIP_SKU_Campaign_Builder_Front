import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
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

/* ---------- MAPEAMENTO ---------- */
export function getAdvancedFieldComponent(field: AdvancedFilterBackendField): React.FC<any> | null {
  if (field.type === 'range') return null;
  if (field.type === 'checkbox' && field.values && field.values.length > 0) return Field.MultiSelect;
  if (field.type === 'checkbox' || field.type === 'boolean') return Field.Checkbox;
  if (field.type === 'dropdown') return field.multiple ? Field.MultiSelect : Field.Select;

  const typeMap: Record<string, React.FC<any>> = {
    text: Field.Text,
    number: Field.Text,
  };
  return typeMap[field.type] || Field.Text;
}

/* ---------- HOOK ---------- */
export function useAdvancedFilterForm(state: Partial<DynamicAdvancedFilterFormValues> = {}) {
  const [fields, setFields] = useState<AdvancedFilterBackendField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasReset = useRef(false); // ← EVITA LOOP

  const { state: wizardState, updateCampaignData } = useFormWizard();
  const router = useRouter();

  const form = useForm<DynamicAdvancedFilterFormValues>({
    resolver: zodResolver(advancedFilterSchema),
    defaultValues: { criterios_saida: state.criterios_saida || '' },
    mode: 'onSubmit',
  });

  /* ---------- 1. CARREGA CAMPOS (SÓ QUANDO source_base_id MUDA) ---------- */
  useEffect(() => {
    const loadFields = async () => {
      const sourceBaseId = wizardState.source_base_id;
      if (!sourceBaseId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await axiosInstance.get(endpoints.briefing.step3Segment(sourceBaseId));
        if (res.data.success && Array.isArray(res.data.data)) {
          const apiFields = res.data.data as AdvancedFilterBackendField[];

          const normalized = apiFields.map((f) => ({
            ...f,
            type: f.type || 'text',
            multiple: f.multiple ?? false,
            required: f.required ?? false,
            values: Array.isArray(f.values) ? f.values : [],
          }));

          setFields(normalized);
          hasReset.current = false; // ← permite reset
        } else {
          setError('Erro ao carregar filtros.');
        }
      } catch (err: any) {
        setError('Erro de conexão com o backend.');
      } finally {
        setLoading(false);
      }
    };

    loadFields();
  }, [wizardState.source_base_id]);

  /* ---------- 2. PREENCHE FORM (SÓ UMA VEZ APÓS fields) ---------- */
  useEffect(() => {
    if (fields.length === 0 || hasReset.current) return;

    const defaultValues: any = { criterios_saida: state.criterios_saida || '' };

    fields.forEach((f) => {
      const savedValue = state[f.name];
      if (savedValue !== undefined) {
        defaultValues[f.name] = savedValue;
      } else if (f.multiple) {
        defaultValues[f.name] = [];
      } else if (f.type === 'boolean') {
        defaultValues[f.name] = false;
      } else {
        defaultValues[f.name] = ''; // ← Select aceita string vazia
      }
    });

    form.reset(defaultValues);
    hasReset.current = true;
  }, [fields, state, form]);

  /* ---------- SUBMIT ---------- */
  /* ---------- SUBMIT ---------- */
const handleSubmitWithValidation = () =>
  form.handleSubmit(
    (data) => {
      setError(null);

      const briefingFields = fields.map((field) => {
        const value = data[field.name];
        const formattedValue = Array.isArray(value)
          ? value.map((item: any) => (typeof item === 'object' ? item.value : item))
          : value;

        return {
          name: field.name,
          label: field.label,
          value: formattedValue,
        };
      });

      const extraFields = [
        { name: 'criterios_saida', label: 'Critérios de Saída', value: data.criterios_saida || '' },
        { name: 'outras_exclusoes', label: 'Outras Exclusões', value: data.outras_exclusoes || '' },
        { name: 'informacoes_extras', label: 'Informações Extras', value: data.informacoes_extras || '' },
        { name: 'base_origin', label: 'Base de Origem', value: data.base_origin || '' },
      ].filter((f) => data[f.name] !== undefined);

      const payload = {
        briefing: {
          fields: [...briefingFields, ...extraFields],
        },
      };

      // MAPEIA PARA CAMPODATA (useAudienceQuery)
      const mappedData: Record<string, any> = {};
      [...briefingFields, ...extraFields].forEach((field) => {
        mappedData[field.name] = field.value;
      });

      console.log('Salvando no contexto:', { ...payload, ...mappedData });
      updateCampaignData({ ...payload, ...mappedData }); // SALVA TUDO
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
    setError,
    handleSubmitWithValidation,
    handlePrevious,
    getAdvancedFieldComponent,
  };
}