// src/hooks/useBasicInfoForm.ts
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import axiosInstance, { endpoints } from 'src/utils/axios';
import { basicInfoSchema } from 'src/utils/schemas/basicInfoSchema';

import { useFormWizard } from 'src/context/FormWizardContext';

import { Field } from 'src/components/hook-form';

export interface BackendField {
  name: string;
  label: string;
  type: string;
  values?: any[];
  required?: boolean;
  multiple?: boolean;
  placeholder?: string;
  helperText?: string;
}

export interface DynamicFormValues {
  campaign_name: string;
  start_date: string | null;
  end_date: string | null;
  is_continuous: boolean;
  [key: string]: any;
}

/* ---------- MAPEAMENTO DE COMPONENTES ---------- */
export function getFieldComponent(field: BackendField): React.FC<any> | null {
  const typeMap: Record<string, React.FC<any>> = {
    text: Field.Text,
    date: Field.DatePicker,
    code: Field.Code,
    editor: Field.Editor,
    rating: Field.Rating,
    slider: Field.Slider,
    upload: Field.Upload,
    'upload-box': Field.UploadBox,
    'upload-avatar': Field.UploadAvatar,
    phone: Field.Phone,
    country: Field.CountrySelect,
    autocomplete: Field.Autocomplete,
    radio: Field.RadioGroup,
    switch: Field.Switch,
  };

  if (field.type === 'dropdown') {
    return field.multiple ? Field.MultiSelect : Field.Select;
  }
  if (field.type === 'checkbox') {
    return field.multiple ? Field.MultiCheckbox : Field.Checkbox;
  }
  if (field.type === 'switch' && field.multiple) {
    return Field.MultiSwitch;
  }

  return typeMap[field.type] || null;
}

/* ---------- HOOK ---------- */
export function useBasicInfoForm(state: Partial<DynamicFormValues> = {}) {
  const [fields, setFields] = useState<BackendField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { updateCampaignData } = useFormWizard();
  const router = useRouter();

  const form = useForm<DynamicFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      campaign_name: state.campaign_name || '',
      start_date: state.start_date || null,
      end_date: state.end_date || null,
      is_continuous: state.is_continuous || false,
      disponibilizacao_call_center_sim: false,
      disponibilizacao_call_center_nao: false,
    },
    mode: 'onSubmit',
  });

  /* ---------- CARREGA CAMPOS DA API ---------- */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(endpoints.briefing.step1);
        if (res.data.success && Array.isArray(res.data.data)) {
          const apiFields = res.data.data as BackendField[];

          /* ---- INICIALIZA defaultValues para TODOS os campos dinâmicos ---- */
          const dynamicDefaults: Record<string, any> = {};
          apiFields.forEach((f) => {
            if (f.multiple) {
              dynamicDefaults[f.name] = [];               
            } else if (f.type === 'text' || f.type === 'code' || f.type === 'editor') {
              dynamicDefaults[f.name] = '';
            } else {
              dynamicDefaults[f.name] = null;            
            }
          });

          form.reset((prev) => ({ ...prev, ...dynamicDefaults }));
          setFields(apiFields);
        } else {
          setError(res.data.errorMessage || 'Erro ao carregar campos.');
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Erro de conexão.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [form]);

  const onSubmit = (data: DynamicFormValues) => updateCampaignData(data);

  const handleNext = async (data: DynamicFormValues) => {
    updateCampaignData(data);
    router.push('/briefing/audience-definition');
  };

  const selectedChannels = form.watch('channel') || [];

  /* ---------- CAMPOS ESTABILIZADOS ---------- */
  const channelField = useMemo(() => fields.find((f) => f.name === 'channel'), [fields]);
  const campaignObjectiveField = useMemo(() => fields.find((f) => f.name === 'campaign_objective'), [fields]);
  const campaignTypeField = useMemo(() => fields.find((f) => f.name === 'campaign_type'), [fields]);
  const offerField = useMemo(() => fields.find((f) => f.name === 'offer'), [fields]);
  const campaignCodesField = useMemo(() => fields.find((f) => f.name === 'campaign_codes'), [fields]);

  return {
    ...form,
    fields,
    loading,
    error,
    onSubmit,
    handleNext,
    selectedChannels,
    channelField,
    campaignObjectiveField,
    campaignTypeField,
    offerField,
    campaignCodesField,
    getFieldComponent,
  };
}