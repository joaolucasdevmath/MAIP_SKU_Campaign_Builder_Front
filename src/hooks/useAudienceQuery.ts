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
      
      const campaign_channels: Record<string, number> = {
        EMAIL: campaignData.quantity_Email || 0,
      };

     
      const filters: Record<string, string> = {
        base_origin: String(campaignData.base_origin?.[0] || campaignData.source_base || "").toUpperCase(),
        nom_grupo_marca: campaignData.nom_grupo_marca || campaignData.brand || "",
        segmentations: Array.isArray(campaignData.segmentations)
          ? campaignData.segmentations.join(" AND ")
          : String(campaignData.segmentations || ""),
        nom_tipo_curso: Array.isArray(campaignData.nom_tipo_curso)
          ? campaignData.nom_tipo_curso.join(", ")
          : String(campaignData.nom_tipo_curso || ""),
        tipo_captacao: Array.isArray(campaignData.tipo_captacao)
          ? campaignData.tipo_captacao.join(", ")
          : String(campaignData.tipo_captacao || ""),
        modalidade: Array.isArray(campaignData.modalidade)
          ? campaignData.modalidade.join(", ")
          : String(campaignData.modalidade || ""),
        nom_curso: Array.isArray(campaignData.nom_curso)
          ? campaignData.nom_curso.join(", ")
          : String(campaignData.nom_curso || ""),
        nom_curso_exclude: Array.isArray(campaignData.nom_curso_exclude)
          ? campaignData.nom_curso_exclude.join(", ")
          : String(campaignData.nom_curso_exclude || ""),
        nom_periodo_academico: Array.isArray(campaignData.nom_periodo_academico)
          ? campaignData.nom_periodo_academico.join(", ")
          : String(campaignData.nom_periodo_academico || ""),
        atl_niveldeensino__c: Array.isArray(campaignData.atl_niveldeensino__c)
          ? campaignData.atl_niveldeensino__c.join(", ")
          : String(campaignData.atl_niveldeensino__c || ""),
        forma_ingresso: Array.isArray(campaignData.forma_ingresso)
          ? campaignData.forma_ingresso.join(", ")
          : String(campaignData.forma_ingresso || ""),
      };

      // Validação dos campos obrigatórios
      if (!filters.base_origin) {
        throw new Error("O campo 'base_origin' é obrigatório.");
      }
      if (!filters.nom_grupo_marca) {
        throw new Error("O campo 'nom_grupo_marca' é obrigatório.");
      }
      if (!campaign_channels.EMAIL) {
        throw new Error("A quantidade de emails em 'campaign_channels.EMAIL' é obrigatória.");
      }

      
      const queryPayload: GenerateQueryPayload = {
        campaign_name: campaignData.campaign_name,
        campaign_type: campaignData.campaignType ?? "",
        campaign_objective: campaignData.campaign_objective?.[0],
        campaign_channels,
        filters,
      };

      console.log('🚀 Enviando payload para geração de query:', JSON.stringify(queryPayload, null, 2));

      // Enviar requisição para a API
      const response = await axiosInstance.post<GenerateQueryResponse>(
        endpoints.briefing.generateQuery,
        queryPayload
      );
      const result = response.data;
      console.log('📋 Resposta completa da API:', JSON.stringify(result, null, 2));

      // Processar resposta da API
      if (result.success && result.data) {
        const apiGeneratedQueryText =
          typeof result.data === 'object' && 'query_text' in result.data
            ? (result.data as any).query_text
            : result.data;

        console.log('Query gerada:', apiGeneratedQueryText);

        // Validar se a query é uma string válida
        if (typeof apiGeneratedQueryText !== 'string' || !apiGeneratedQueryText.trim()) {
          throw new Error('A query gerada não é uma string válida.');
        }

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
      toast.error(`Erro ao gerar query: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
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
        generatedQuery,
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