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
      etapa_funil: state.etapa_funil || [], // Adiciona etapa_funil
      status_vestibular: state.status_vestibular || [], // Adiciona status_vestibular
      faixa_etaria: state.faixa_etaria || { min: 0, max: 100 },
      ultima_interacao: state.ultima_interacao || 30,
      remover_regua_master: state.remover_regua_master || false,
      documentacao_principal_enviada: state.documentacao_principal_enviada || false,
      atualizacao_automatica: state.atualizacao_automatica || false,
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
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(endpoints.briefing.step3Segment(sourceBaseId));
        
        let tipoCaptacaoField = res.data.data.find((f: any) => f.name === 'tipo_captacao');
        
        if (!tipoCaptacaoField) {
          tipoCaptacaoField = {
            name: 'tipo_captacao',
            label: 'Forma de Ingresso',
            values: [
              { value: 'ENEM', label: 'Enem' },
              { value: 'Transf. Externa', label: 'Transferência Externa' },
              { value: 'Vestibular', label: 'Vestibular' },
              { value: 'Vestibular (Ingresso Simplificado)', label: 'Ingresso Simplificado' },
            ],
            required: false,
            type: 'checkbox',
          };
          res.data.data.push(tipoCaptacaoField);
        }
        
        const filteredFields = res.data.data.filter((f: any) => String(sourceBaseId) === '2' || f.name !== 'status_vestibular');
        if (res.data.success && Array.isArray(filteredFields)) {
          const mappedFields = filteredFields.map((field: any) => {
            // Etapa de Funil (multi-select dropdown, igual Nível de Ensino)
            if (field.name === 'etapa_funil') {
              return {
                ...field,
                name: 'etapa_funil',
                label: 'Etapa de Funil',
                values: Array.isArray(field.values)
                  ? field.values.filter(
                      (option: any, index: number, array: any[]) =>
                        array.findIndex((item: any) => item.value === option.value) === index
                    )
                  : [],
                type: 'dropdown',
                multiple: true,
              };
            }
            // Nível de Ensino
            if (field.name === 'nom_tipo_curso') {
              return {
                ...field,
                name: 'atl_niveldeensino__c',
                label: 'Nível de Ensino',
                values: field.values || [],
                type: 'dropdown',
              };
            }
            // Status do Vestibular
            if (field.name === 'status_vestibular') {
              return {
                ...field,
                name: 'status_vestibular',
                label: 'Status do Vestibular',
                values: [
                  { value: 'reprovado', label: 'Reprovado' },
                  { value: 'pendente', label: 'Pendente' },
                  { value: 'faltosos', label: 'Faltosos' },
                  { value: 'aprovado', label: 'Aprovado' },
                ], // Força as opções desejadas
                type: 'dropdown',
              };
            }
            // Forma de Ingresso (checkboxes individuais)
            if (field.name === 'tipo_captacao' && Array.isArray(field.values)) {
              return field.values.map((option: any) => {
                let name = '';
                if (option.value === 'ENEM') name = 'forma_ingresso_enem';
                else if (option.value === 'Transf. Externa') name = 'forma_ingresso_transferencia_externa';
                else if (option.value === 'Vestibular') name = 'forma_ingresso_vestibular';
                else if (option.value === 'Vestibular (Ingresso Simplificado)') name = 'forma_ingresso_ingresso_simplificado';
                else name = `forma_ingresso_${option.value.toLowerCase().replace(/\s+/g, '_')}`;
                return {
                  ...field,
                  name,
                  label: option.label,
                  type: 'boolean',
                  values: undefined,
                  required: field.required,
                };
              });
            }
            // Demais campos
            return {
              ...field,
              values: field.values
                ? field.values.filter(
                    (option: any, index: number, array: any[]) =>
                      array.findIndex((item: any) => item.value === option.value) === index
                  )
                : [],
            };
          });
          const flattenedFields = mappedFields.flat();
          
          setFields(flattenedFields.filter((f: any) => f.name !== 'status_vestibular' && f.name !== 'status_prova'));
        } else {
          setError(res.data.errorMessage || 'Erro ao carregar campos do backend.');
        }
      } catch (err) {
        setError('Erro ao conectar ao backend. Verifique se a API está rodando.');
      } finally {
        setLoading(false);
      }
    };
    loadBackendData();
  }, [formWizardState.source_base_id]);

  const transformFormData = (formValues: DynamicAdvancedFilterFormValues) => ({
    ...formValues,
    atl_niveldeensino__c: Array.isArray(formValues.atl_niveldeensino__c)
      ? formValues.atl_niveldeensino__c.map((item: any) => typeof item === 'object' && item.value ? item.value : item)
      : formValues.atl_niveldeensino__c,
    modalidade: Array.isArray(formValues.modalidade)
      ? formValues.modalidade.map((item: any) => typeof item === 'object' && item.value ? item.value : item)
      : formValues.modalidade,
    nom_curso: Array.isArray(formValues.nom_curso)
      ? formValues.nom_curso.map((item: any) => typeof item === 'object' && item.value ? item.value : item)
      : formValues.nom_curso,
    nom_curso_exclude: Array.isArray(formValues.nom_curso_exclude)
      ? formValues.nom_curso_exclude.map((item: any) => typeof item === 'object' && item.value ? item.value : item)
      : formValues.nom_curso_exclude,
    etapa_funil: Array.isArray(formValues.etapa_funil)
      ? formValues.etapa_funil.map((item: any) => typeof item === 'object' && item.value ? item.value : item)
      : formValues.etapa_funil,
    status_vestibular: Array.isArray(formValues.status_vestibular)
      ? formValues.status_vestibular.map((item: any) => typeof item === 'object' && item.value ? item.value : item)
      : formValues.status_vestibular,
  });

  const onSubmit = (data: DynamicAdvancedFilterFormValues) => {
    const transformedData = transformFormData(data);
    const formattedData = {
      nom_grupo_marca: Array.isArray(transformedData.nom_grupo_marca)
        ? transformedData.nom_grupo_marca.join(',')
        : transformedData.nom_grupo_marca,
      modalidade: transformedData.modalidade,
      nom_curso: transformedData.nom_curso,
      nom_curso_exclude: transformedData.nom_curso_exclude,
      etapa_funil: Array.isArray(transformedData.etapa_funil)
        ? transformedData.etapa_funil.join(',')
        : transformedData.etapa_funil,
      status_vestibular: Array.isArray(transformedData.status_vestibular)
        ? transformedData.status_vestibular.join(',')
        : transformedData.status_vestibular,
      forma_ingresso_enem: transformedData.forma_ingresso_enem,
      forma_ingresso_transferencia_externa: transformedData.forma_ingresso_transferencia_externa,
      forma_ingresso_vestibular: transformedData.forma_ingresso_vestibular,
      forma_ingresso_ingresso_simplificado: transformedData.forma_ingresso_ingresso_simplificado,
      atl_niveldeensino__c: transformedData.atl_niveldeensino__c,
      faixa_etaria: transformedData.faixa_etaria,
      ultima_interacao: transformedData.ultima_interacao,
      remover_regua_master: transformedData.remover_regua_master,
      documentacao_principal_enviada: transformedData.documentacao_principal_enviada,
      atualizacao_automatica: transformedData.atualizacao_automatica,
      outras_exclusoes: transformedData.outras_exclusoes,
      criterios_saida: transformedData.criterios_saida,
      disponibilizacao_call_center_sim: transformedData.disponibilizacao_call_center_sim,
      disponibilizacao_call_center_nao: transformedData.disponibilizacao_call_center_nao,
      informacoes_extras: transformedData.informacoes_extras,
    };
    updateCampaignData(formattedData);
  };

  const handleNext = async (data: DynamicAdvancedFilterFormValues) => {
    try {
      const transformedData = transformFormData(data);
      const formattedData = {
        nom_grupo_marca: Array.isArray(transformedData.nom_grupo_marca)
          ? transformedData.nom_grupo_marca.join(',')
          : transformedData.nom_grupo_marca,
        modalidade: transformedData.modalidade,
        nom_curso: transformedData.nom_curso,
        nom_curso_exclude: transformedData.nom_curso_exclude,
        etapa_funil: Array.isArray(transformedData.etapa_funil)
          ? transformedData.etapa_funil.join(',')
          : transformedData.etapa_funil,
        status_vestibular: Array.isArray(transformedData.status_vestibular)
          ? transformedData.status_vestibular.join(',')
          : transformedData.status_vestibular,
        forma_ingresso_enem: transformedData.forma_ingresso_enem,
        forma_ingresso_transferencia_externa: transformedData.forma_ingresso_transferencia_externa,
        forma_ingresso_vestibular: transformedData.forma_ingresso_vestibular,
        forma_ingresso_ingresso_simplificado: transformedData.forma_ingresso_ingresso_simplificado,
        atl_niveldeensino__c: transformedData.atl_niveldeensino__c,
        faixa_etaria: transformedData.faixa_etaria,
        ultima_interacao: transformedData.ultima_interacao,
        remover_regua_master: transformedData.remover_regua_master,
        documentacao_principal_enviada: transformedData.documentacao_principal_enviada,
        atualizacao_automatica: transformedData.atualizacao_automatica,
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

  const handleSubmitWithValidation = () => {
    const rawValues = form.getValues();
    const transformedValues = transformFormData(rawValues);
    Object.entries(transformedValues).forEach(([key, value]) => {
      form.setValue(key as any, value);
    });
    return form.handleSubmit(
      (formValues) => {
        handleNext(formValues);
        
        
      },
      (errors) => {
       
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
    handleNext,
    handlePrevious,
    scrollToErrors,
    handleSubmitWithValidation,
  };
}