import type Template from 'src/types/templatesTypes';

import { useState } from 'react';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { useFormWizard } from 'src/context/FormWizardContext';

import { toast } from 'src/components/snackbar';

const formatDateToYYYYMMDD = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};

interface UseTemplateReturn {
  templates: Template[];
  isLoading: boolean;
  isSaving: boolean;
  fetchTemplates: () => Promise<void>;
  saveTemplate: (isTemplate: boolean, description: string) => Promise<void>;
}

export const useTemplate = (): UseTemplateReturn => {
  const { state: campaignData, updateCampaignData } = useFormWizard();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchTemplates = async (): Promise<void> => {
    console.log('Iniciando fetchTemplates');
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(endpoints.briefing.getTemplate);
      console.log('Resposta bruta do backend:', response.data);
      if (response.data.success && Array.isArray(response.data.data)) {
        setTemplates(response.data.data);
      } else {
        setTemplates([]);
        toast.error(`Erro ao carregar templates: Dados inválidos recebidos do servidor`);
      }
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
      toast.error(
        `Erro ao carregar templates: ${error.response?.data?.errorMessage || 'Erro de conexão com o servidor'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplate = async (isTemplate: boolean, description: string): Promise<void> => {
    setIsSaving(true);
    try {
      const channels = campaignData.channel
        ? campaignData.channel.map((channel: string, index: number) => ({
            id: index + 1,
            quantity: campaignData[`quantity_${channel.toUpperCase()}`] || 500,
          }))
        : [{ id: 1, quantity: 500 }];

      const briefingFields = [
        { name: 'nom_grupo_marca', value: campaignData.nom_grupo_marca || '' },
        { name: 'modalidade', value: campaignData.modalidade?.join(', ') || '' },
        {
          name: 'atl_niveldeensino__c',
          value: campaignData.atl_niveldeensino__c?.join(', ') || '',
        },
        {
          name: 'forma_ingresso',
          value:
            [
              campaignData.forma_ingresso_enem ? '' : '',
              campaignData.forma_ingresso_ingresso_simplificado ? '' : '',
              campaignData.forma_ingresso_transferencia_externa ? '' : '',
              campaignData.forma_ingresso_vestibular ? '' : '',
            ]
              .filter(Boolean)
              .join(', ') || '',
        },
        { name: 'ultima_interacao', value: campaignData.ultima_interacao ?? '' },
        { name: 'remover_regua_master', value: campaignData.remover_regua_master ?? '' },
        {
          name: 'documentacao_principal_enviada',
          value: campaignData.documentacao_principal_enviada ?? '',
        },
        { name: 'atualizacao_automatica', value: campaignData.atualizacao_automatica ?? '' },
        {
          name: 'disponibilizacao_call_center_nao',
          value: campaignData.disponibilizacao_call_center_nao ?? '',
        },
        { name: 'base_origin', value: campaignData.base_origin?.[0] || '' },
      ];

      const templateData = {
        campaign: {
          core: {
            offer: campaignData.offer || '',
            code: campaignData.campaign_codes || '',
            campaign_name: campaignData.campaign_name || 'Sem nome',
            campaign_type: campaignData.campaign_type?.[0] || '',
            campaign_objective: campaignData.campaign_objective?.[0] || '',
            start_date: formatDateToYYYYMMDD(campaignData.start_date),
            end_date: formatDateToYYYYMMDD(campaignData.end_date),
            segmentation_sql: campaignData.generatedQuery || '',
            audience_snapshot: campaignData.audienceInfo?.audienceSize ?? 0,
            status: isTemplate ? 'draft' : 'complete',
            is_template: isTemplate,
            description,
          },
          channels,
        },
        briefing: {
          core: {
            name: campaignData.campaign_name || 'Sem nome',
            segmentation: campaignData.segmentation?.join(' AND ') || '',
            source_base_id: campaignData.source_base_id || '0',
            source_base: campaignData.base_origin?.[0] || 'de_geral_leads',
          },
          fields: briefingFields,
        },
      };

      console.log('Payload enviado:', JSON.stringify(templateData, null, 2));
      const response = await axiosInstance.post(endpoints.briefing.saveTemplate, templateData);
      console.log('Resposta do backend:', response.data);

      if (response.data.success) {
        toast.success(isTemplate ? 'Template salvo com sucesso!' : 'Campanha salva com sucesso!');
        updateCampaignData({
          ...campaignData,
          template_id: response.data.data.id,
          template_name: response.data.data.campaign_name,
        });
      } else {
        toast.error(
          `Erro ao salvar template: ${response.data.errorMessage || 'Erro desconhecido'}`
        );
      }
    } catch (error) {
      console.error('Erro ao salvar template:', error);
      toast.error(
        `Erro ao salvar template: ${error.response?.data?.errorMessage || 'Erro de conexão com o servidor'}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
    templates,
    isLoading,
    isSaving,
    fetchTemplates,
    saveTemplate,
  };
};
