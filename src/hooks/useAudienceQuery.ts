import type { GenerateQueryPayload, GenerateQueryResponse } from 'src/types/briefingTypes';

import { useState, useEffect } from 'react';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { useFormWizard } from 'src/context/FormWizardContext';

import { toast } from 'src/components/snackbar';

export interface UseAudienceQueryReturn {
  isGenerating: boolean;
  generatedQuery: string | null;
  handleGenerateQuery: () => Promise<void>;
  handleSaveAsDraft: () => Promise<void>;
  clearQuery: () => void;
  clearAllData: () => void;
}

export const useAudienceQuery = (): UseAudienceQueryReturn => {
  const { state: campaignData, updateCampaignData } = useFormWizard();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuery, setGeneratedQuery] = useState<string | null>(
    campaignData.generated_query || campaignData.generatedQuery || null
  );

  useEffect(() => {
    const contextQuery = campaignData.generated_query || campaignData.generatedQuery;
    if (contextQuery && contextQuery !== generatedQuery) {
      setGeneratedQuery(contextQuery);
    }
  }, [campaignData.generated_query, campaignData.generatedQuery, generatedQuery]);

  const handleGenerateQuery = async (): Promise<void> => {
    setIsGenerating(true);
    try {
      // Montar campaign_channels
      const campaign_channels: Record<string, number> = Object.entries(
        campaignData.campaign_channels || campaignData.channels || {}
      ).reduce(
        (acc, [key, val]) => {
          acc[key.toUpperCase()] = val as number;
          return acc;
        },
        {} as Record<string, number>
      );
      if (typeof campaignData.quantity_Email === 'number') {
        campaign_channels.EMAIL = campaignData.quantity_Email;
      }

      // ...existing code...

      // All filters must be strings to avoid backend errors
      const filters: Record<string, string> = {
        base_origin: String(
          Array.isArray(campaignData.base_origin)
            ? campaignData.base_origin[0] ?? ''
            : campaignData.base_origin ?? campaignData.baseOrigin ?? campaignData.source_base ?? ''
        ).toUpperCase(),
        nom_grupo_marca:
          campaignData.nom_grupo_marca ?? campaignData.nomGrupoMarca ?? campaignData.brand ?? '',
        segmentations: Array.isArray(campaignData.segmentations)
          ? campaignData.segmentations.length > 0
            ? campaignData.segmentations.join(' AND ')
            : ''
          : String(campaignData.segmentations || campaignData.segmentation || ''),
        nom_tipo_curso: Array.isArray(campaignData.nom_tipo_curso)
          ? campaignData.nom_tipo_curso.length > 0
            ? campaignData.nom_tipo_curso.join(', ')
            : ''
          : campaignData.nom_tipo_curso ?? '',
        tipo_captacao: Array.isArray(campaignData.tipo_captacao)
          ? campaignData.tipo_captacao.length > 0
            ? campaignData.tipo_captacao.join(', ')
            : ''
          : campaignData.tipo_captacao ?? '',
        modalidade: Array.isArray(campaignData.modalidade)
          ? campaignData.modalidade.length > 0
            ? campaignData.modalidade.join(', ')
            : ''
          : campaignData.modalidade ?? '',
        nom_curso: Array.isArray(campaignData.nom_curso)
          ? campaignData.nom_curso.length > 0
            ? campaignData.nom_curso.join(', ')
            : ''
          : campaignData.nom_curso ?? '',
        nom_curso_exclude: Array.isArray(campaignData.nom_curso_exclude)
          ? campaignData.nom_curso_exclude.length > 0
            ? campaignData.nom_curso_exclude.join(', ')
            : ''
          : campaignData.nom_curso_exclude ?? '',
        nom_periodo_academico: Array.isArray(campaignData.nom_periodo_academico)
          ? campaignData.nom_periodo_academico.length > 0
            ? campaignData.nom_periodo_academico.join(', ')
            : ''
          : campaignData.nom_periodo_academico ?? '',
        status_funil: Array.isArray(campaignData.status_funil)
          ? campaignData.status_funil.length > 0
            ? campaignData.status_funil.join(', ')
            : ''
          : String(campaignData.status_funil || campaignData.funnelStage || ''),
        status_vestibular: Array.isArray(campaignData.status_vestibular)
          ? campaignData.status_vestibular.length > 0
            ? campaignData.status_vestibular.join(', ')
            : ''
          : String(campaignData.status_vestibular || campaignData.vestibularStatus || ''),
        atl_niveldeensino__c: Array.isArray(campaignData.atl_niveldeensino__c)
          ? campaignData.atl_niveldeensino__c.length > 0
            ? campaignData.atl_niveldeensino__c.join(', ')
            : ''
          : campaignData.atl_niveldeensino__c ?? '',
        forma_ingresso: Array.isArray(campaignData.forma_ingresso)
          ? campaignData.forma_ingresso.length > 0
            ? campaignData.forma_ingresso.join(', ')
            : ''
          : campaignData.forma_ingresso ?? '',
      };

      // Debug: log the payload before sending
      console.log('DEBUG filters:', filters);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { segmentation, segmentations, campaign_type, ...restCampaignData } = campaignData;

      const queryPayload: GenerateQueryPayload = {
        ...restCampaignData,
        filters,
        campaign_channels,
      };

      // ...existing code...

      console.log('🚀 Enviando payload para geração de query:', queryPayload);
      const response = await axiosInstance.post<GenerateQueryResponse>(
        endpoints.briefing.generateQuery,
        queryPayload
      );
      const result = response.data;
      console.log('📋 Resposta da API:', result);

      if (result.success && result.data) {
        const apiGeneratedQueryText =
          typeof result.data === 'object' && 'query_text' in result.data
            ? (result.data as any).query_text
            : result.data;
        setGeneratedQuery(apiGeneratedQueryText);
        updateCampaignData({
          generated_query: apiGeneratedQueryText,
          generatedQuery: apiGeneratedQueryText,
        });
        toast.success('Query da audiência gerada com sucesso!');
      } else {
        throw new Error(result.errorMessage || 'Erro na geração da query');
      }
    } catch (err) {
      console.error('Erro ao gerar query da audiência:', err);
      if (err instanceof Error) {
        toast.error(`Erro ao gerar query: ${err.message}`);
      } else {
        toast.error('Erro desconhecido ao gerar query da audiência');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAsDraft = async (): Promise<void> => {
    try {
      const draftData = {
        ...campaignData,
        status: 'draft',
        saved_at: new Date().toISOString(),
        generated_query: generatedQuery,
        generatedQuery, // Para compatibilidade
      };
      updateCampaignData(draftData);
      toast.success('Campanha salva como rascunho!');
    } catch (err) {
      console.error('Erro ao salvar como rascunho:', err);
      toast.error('Erro ao salvar como rascunho');
    }
  };

  const clearQuery = (): void => {
    setGeneratedQuery(null);
    updateCampaignData({
      ...campaignData,
      generated_query: null,
      generatedQuery: null,
      audienceInfo: {},
    });
    toast.success('Query limpa! Você pode gerar uma nova query.');
  };

  const clearAllData = (): void => {
    setGeneratedQuery(null);
    const clearedData = {
      campaign_name: '',
      campaignName: '',
      generated_query: null,
      generatedQuery: null,
      audienceInfo: {},
      queries: [],
    };
    updateCampaignData(clearedData);
    try {
      sessionStorage.removeItem('formWizardData');
    } catch (error) {
      console.warn('Erro ao limpar sessionStorage:', error);
    }
    toast.success('Todos os dados foram limpos!');
  };

  return {
    isGenerating,
    generatedQuery,
    handleGenerateQuery,
    handleSaveAsDraft,
    clearQuery,
    clearAllData,
  };
};
