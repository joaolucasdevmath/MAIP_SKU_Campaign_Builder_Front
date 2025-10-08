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
      
      const campaign_channels: Record<string, number> = {};
      if (Array.isArray(campaignData.channel)) {
        campaignData.channel.forEach((channel: string) => {
          const channelKeyUpper = channel.toUpperCase();
          const channelKeyOriginal = channel;
          const quantityKeys = [
            `quantity_${channelKeyUpper}`,
            `quantity_${channelKeyOriginal}`,
            `quantity_${channelKeyOriginal.toLowerCase()}`,
          ];
          let quantity: any;
          // eslint-disable-next-line no-restricted-syntax
          for (const quantityKey of quantityKeys) {
            quantity = campaignData[quantityKey];
            
            if (
              quantity !== undefined &&
              quantity !== null &&
              !Number.isNaN(Number(quantity)) &&
              Number(quantity) > 0
            ) {
              campaign_channels[channelKeyUpper] = Number(quantity);
              break;
            }
          }
          if (!campaign_channels[channelKeyUpper]) {
            console.warn(`[DEBUG useAudienceQuery] Canal ${channel} ignorado: valor inválido (${quantity})`);
          }
        });
      }

      // Validação de campaign_channels
      if (Object.keys(campaign_channels).length === 0) {
        throw new Error("Pelo menos um canal deve ser especificado em 'campaign_channels'.");
      }

      // Determinar filtros com base no base_origin
      const baseOrigin = String(campaignData.base_origin?.[0] || campaignData.source_base || "").toUpperCase();
      let segmentations = "";
      let nom_periodo_academico = [];
      let status_funil: string[] = [];
      let modalidade: string[] = [];
      let atl_niveldeensino_c = [];
      let forma_ingresso = [];

      if (baseOrigin === 'DE_GERAL_LEADS') {
        // Para DE_GERAL_LEADS: usar modalidade, atl_niveldeensino_c, forma_ingresso
        const modalidadeStr = Array.isArray(campaignData.modalidade) && campaignData.modalidade.length > 0
          ? `modalidade IN (${campaignData.modalidade.map((m: string) => `'${m}'`).join(',')})`
          : "";
        const atl_niveldeensinoStr = Array.isArray(campaignData.atl_niveldeensino__c) && campaignData.atl_niveldeensino__c.length > 0
          ? `atl_niveldeensino_c = '${campaignData.atl_niveldeensino__c[0]}'`
          : "";
        const forma_ingressoStr = Array.isArray(campaignData.forma_ingresso) && campaignData.forma_ingresso.length > 0
          ? `forma_ingresso = '${campaignData.forma_ingresso[0]}'`
          : "";
        segmentations = [modalidadeStr, atl_niveldeensinoStr, forma_ingressoStr].filter(Boolean).join(" AND ");
        modalidade = Array.isArray(campaignData.modalidade) ? campaignData.modalidade : [];
        atl_niveldeensino_c = Array.isArray(campaignData.atl_niveldeensino__c) ? campaignData.atl_niveldeensino__c : [];
        forma_ingresso = Array.isArray(campaignData.forma_ingresso) ? campaignData.forma_ingresso : [];
      } else {
        // Para DE_GERAL_OPORTUNIDADE: usar nom_periodo_academico e status_funil
        const nom_periodoStr = Array.isArray(campaignData.nom_periodo_academico) && campaignData.nom_periodo_academico.length > 0
          ? `nom_periodo_academico IN (${campaignData.nom_periodo_academico.map((p: string) => `'${p}'`).join(',')})`
          : "";
        const status_funilStr = campaignData.status_funil || "";
        segmentations = [nom_periodoStr, status_funilStr].filter(Boolean).join(" AND ");
        nom_periodo_academico = Array.isArray(campaignData.nom_periodo_academico) ? campaignData.nom_periodo_academico : [''];
        status_funil = Array.isArray(campaignData.status_funil)
          ? campaignData.status_funil
          : (typeof campaignData.status_funil === 'string' && campaignData.status_funil ? [campaignData.status_funil] : []);
      }

      // Construir filters
      const filters: Record<string, any> = {
        base_origin: baseOrigin,
        nom_grupo_marca: campaignData.nom_grupo_marca || campaignData.brand || '',
        segmentations,
        nom_tipo_curso: Array.isArray(campaignData.nom_tipo_curso) ? campaignData.nom_tipo_curso : [],
        tipo_captacao: Array.isArray(campaignData.tipo_captacao) ? campaignData.tipo_captacao : [],
        modalidade,
        nom_curso: Array.isArray(campaignData.nom_curso) ? campaignData.nom_curso : [],
        nom_curso_exclude: Array.isArray(campaignData.nom_curso_exclude) ? campaignData.nom_curso_exclude : [],
        nom_periodo_academico,
        status_funil,
        atl_niveldeensino_c,
        forma_ingresso,
      };

      // Validação dos campos obrigatórios
      if (!filters.base_origin) {
        throw new Error("O campo 'base_origin' é obrigatório.");
      }
      if (!filters.nom_grupo_marca) {
        throw new Error("O campo 'nom_grupo_marca' é obrigatório.");
      }

      // Construir payload simplificado
      const queryPayload: GenerateQueryPayload = {
        campaign_name: campaignData.campaign_name || "teste",
        campaign_type: Array.isArray(campaignData.campaign_type)
          ? campaignData.campaign_type[0] || "CAPTAÇÃO"
          : campaignData.campaign_type || campaignData.campaignType || "CAPTAÇÃO",
        campaign_objective: Array.isArray(campaignData.campaign_objective)
          ? campaignData.campaign_objective[0] || "INSCRIÇÃO"
          : campaignData.campaign_objective || campaignData.campaignObjective || "INSCRIÇÃO",
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

        // Captura o journey_name da resposta
        const journeyName = typeof result.data === 'object' && 'journey_name' in result.data
          ? (result.data as any).journey_name
          : undefined;

        console.log('Query gerada:', apiGeneratedQueryText);
        console.log('Journey Name:', journeyName);

        // Validar se a query é uma string válida
        if (typeof apiGeneratedQueryText !== 'string' || !apiGeneratedQueryText.trim()) {
          throw new Error('A query gerada não é uma string válida.');
        }

        const maskedQuery = apiGeneratedQueryText.replace(/(nom_grupo_marca\s*=\s*')([^']*)(')/g, '$1MARCA$3');
        setGeneratedQuery(maskedQuery);

        updateCampaignData({
          generated_query: apiGeneratedQueryText,
          generatedQuery: apiGeneratedQueryText,
          journey_name: journeyName || '',
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