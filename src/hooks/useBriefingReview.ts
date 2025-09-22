import type {
  BriefingPayload,
  BriefingHookReturn,
  BriefingReviewData,
  BriefingApiResponse,
} from 'src/types/briefingTypes';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { useFormWizard } from 'src/context/FormWizardContext';

export const useBriefingReview = (): BriefingHookReturn => {
  const { state: campaignData } = useFormWizard();
  const router = useRouter();

  // Debug: verificar sessionStorage
  useEffect(() => {
    const sessionData = sessionStorage.getItem('formWizardData');
    console.log('🔍 SessionStorage formWizardData:', sessionData);
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        console.log('📦 Dados do sessionStorage parseados:', parsed);
      } catch (error) {
        console.error('❌ Erro ao parsear sessionStorage:', error);
      }
    }
  }, []);

  // Debug: verificar se os dados estão chegando
  console.log('🔍 Debug campaignData no hook:', campaignData);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedBriefing, setGeneratedBriefing] = useState<string | null>(null);

  const handleGenerateBriefing = async (): Promise<void> => {
    try {
      setIsGenerating(true);
      setError(null);

      // Prepare data for API call seguindo o padrão do backend
      const briefingPayload: BriefingPayload = {
        campaign_name: campaignData.campaign_name || campaignData.campaignName,
        brand: campaignData.brand,
        sub_brands: campaignData.subBrands,
        campaign_origin: campaignData.campaignOrigin,
        campaign_type: campaignData.campaign_type || campaignData.campaignType,
        campaign_objective: campaignData.campaign_objective || campaignData.campaignObjective,
        funnel_stage: campaignData.funnelStage,
        base_origin: campaignData.baseOrigin,
        modality: campaignData.modalidade,
        courses: campaignData.nom_curso,
        course_level: campaignData.atl_niveldeensino__c,
        entry_form: campaignData.entryForm,
        allowed_entry_forms: campaignData.allowedEntryForms,
        excluded_entry_forms: campaignData.excludedEntryForms,
        automated_update: campaignData.automatedUpdate,
        call_center_available: campaignData.disponibilizacao_call_center_sim
          ? 'Sim'
          : campaignData.disponibilizacao_call_center_nao
            ? 'Não'
            : undefined,
        call_center_eps: campaignData.callCenterEPS,
        extra_information: campaignData.informacoes_extras || campaignData.extraInformation,
        // Campos dinâmicos do step 3
        nom_grupo_marca: campaignData.nom_grupo_marca,
        status_funil: campaignData.status_funil,
        nom_tipo_curso: campaignData.nom_tipo_curso,
        doc_pend: campaignData.doc_pend,
        tipo_captacao: campaignData.tipo_captacao,
        status_vestibular: campaignData.status_vestibular,
        interacao_oportunidade: campaignData.interacao_oportunidade,
        documentation_sent: campaignData.documentationSent,
        // Campos adicionais do backend
        source_base: campaignData.source_base,
        source_base_id: campaignData.source_base_id,
        segmentation: campaignData.segmentation,
        channel: campaignData.channel,
        offer: campaignData.offer,
        start_date: campaignData.start_date,
        end_date: campaignData.end_date,
        is_continuous: campaignData.is_continuous,
        outras_exclusoes: campaignData.outras_exclusoes,
        criterios_saida: campaignData.criterios_saida,
        forma_ingresso_enem: campaignData.forma_ingresso_enem,
        forma_ingresso_transferencia_externa: campaignData.forma_ingresso_transferencia_externa,
        forma_ingresso_vestibular: campaignData.forma_ingresso_vestibular,
        forma_ingresso_ingresso_simplificado: campaignData.forma_ingresso_ingresso_simplificado,
      };

      console.log('🚀 Enviando payload para API:', briefingPayload);

      const response = await axiosInstance.post<BriefingApiResponse>(
        endpoints.briefing.post,
        briefingPayload
      );

      const result = response.data;
      setGeneratedBriefing(result.briefing || result.message || 'Briefing gerado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar briefing:', err);

      // Tratamento específico para erro 500 do backend
      if (err instanceof Error && err.message.includes('500')) {
        setError(
          'Erro interno do servidor. O briefing foi processado mas houve um problema na resposta da API. Entre em contato com o suporte técnico.'
        );
      } else if (err instanceof Error) {
        setError(`Erro ao gerar briefing: ${err.message}`);
      } else {
        setError('Erro desconhecido ao gerar briefing');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackToBasicInfo = (): void => {
    router.push('/briefing/basic-info');
  };

  const clearBriefing = (): void => {
    setGeneratedBriefing(null);
    setError(null);
  };

  const renderFieldValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'Não especificado';
    }
    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    return value || 'Não especificado';
  };

  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      // Informações Básicas
      campaignName: 'Nome da Campanha',
      brand: 'Marca',
      subBrands: 'Sub-marcas',
      campaignOrigin: 'Origem da Campanha',
      campaignType: 'Tipo de Campanha',
      campaignObjective: 'Objetivo da Campanha',
      channel: 'Canal',
      offer: 'Oferta',
      startDate: 'Data de Início',
      endDate: 'Data de Fim',

      // Segmentação
      sourceBase: 'Base de Origem',
      segmentation: 'Segmentação',
      funnelStage: 'Estágio do Funil',
      baseOrigin: 'Origem da Base',
      modalidade: 'Modalidade',
      nom_curso: 'Cursos',
      atl_niveldeensino_c: 'Nível de Ensino',
      entryForm: 'Forma de Ingresso',
      allowedEntryForms: 'Formas de Ingresso Permitidas',
      excludedEntryForms: 'Formas de Ingresso Excluídas',
      forma_ingresso_enem: 'Forma de Ingresso - ENEM',
      forma_ingresso_transferencia_externa: 'Forma de Ingresso - Transferência Externa',
      forma_ingresso_vestibular: 'Forma de Ingresso - Vestibular',
      forma_ingresso_ingresso_simplificado: 'Forma de Ingresso - Ingresso Simplificado',

      // Configurações Avançadas
      automatedUpdate: 'Atualização Automatizada',
      callCenterAvailable: 'Call Center Disponível',
      callCenterEPS: 'Call Center EPS',
      extraInformation: 'Informações Extras',
      nom_grupo_marca: 'Grupo/Marca',
      status_funil: 'Status do Funil',
      nom_tipo_curso: 'Tipo de Curso',
      doc_pend: 'Documentos Pendentes',
      tipo_captacao: 'Tipo de Captação',
      status_vestibular: 'Status Vestibular',
      interacao_oportunidade: 'Interação Oportunidade',
      documentationSent: 'Documentação Enviada',
      outras_exclusoes: 'Outras Exclusões',
      criterios_saida: 'Critérios de Saída',
      nom_curso_exclude: 'Cursos Excluídos',
    };
    return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  };

  // Organize data by sections seguindo o padrão das outras etapas
  const reviewData: BriefingReviewData = {
    basicInfo: {
      title: '1. Informações Básicas',
      data: {
        // Mapeamento correto dos campos do backend para frontend
        campaignName: campaignData.campaign_name || campaignData.campaignName,
        brand: campaignData.brand,
        subBrands: campaignData.subBrands,
        campaignOrigin: campaignData.campaignOrigin,
        campaignType: campaignData.campaign_type || campaignData.campaignType,
        campaignObjective: campaignData.campaign_objective || campaignData.campaignObjective,
        channel: campaignData.channel,
        offer: campaignData.offer,
        startDate: campaignData.start_date,
        endDate: campaignData.end_date,
      },
    },
    segmentation: {
      title: '2. Segmentação',
      data: {
        sourceBase: campaignData.source_base,
        segmentation: campaignData.segmentation,
      },
    },
    advancedFilters: {
      title: '3. Configurações Avançadas',
      data: {
        // Campos movidos da segmentação
        funnelStage: campaignData.funnelStage,
        baseOrigin: campaignData.baseOrigin,
        modalidade: campaignData.modalidade,
        nom_curso: campaignData.nom_curso,
        atl_niveldeensino_c: campaignData.atl_niveldeensino__c,
        entryForm: campaignData.entryForm,
        allowedEntryForms: campaignData.allowedEntryForms,
        excludedEntryForms: campaignData.excludedEntryForms,
        // Campos de forma de ingresso
        forma_ingresso_enem: campaignData.forma_ingresso_enem,
        forma_ingresso_transferencia_externa: campaignData.forma_ingresso_transferencia_externa,
        forma_ingresso_vestibular: campaignData.forma_ingresso_vestibular,
        forma_ingresso_ingresso_simplificado: campaignData.forma_ingresso_ingresso_simplificado,
        // Outros campos de configurações avançadas
        automatedUpdate: campaignData.automatedUpdate,
        callCenterAvailable: campaignData.disponibilizacao_call_center_sim
          ? 'Sim'
          : campaignData.disponibilizacao_call_center_nao
            ? 'Não'
            : undefined,
        callCenterEPS: campaignData.callCenterEPS,
        extraInformation: campaignData.informacoes_extras || campaignData.extraInformation,
        nom_grupo_marca: campaignData.nom_grupo_marca,
        status_funil: campaignData.status_funil,
        nom_tipo_curso: campaignData.nom_tipo_curso,
        doc_pend: campaignData.doc_pend,
        tipo_captacao: campaignData.tipo_captacao,
        status_vestibular: campaignData.status_vestibular,
        interacao_oportunidade: campaignData.interacao_oportunidade,
        documentationSent: campaignData.documentationSent,
        outras_exclusoes: campaignData.outras_exclusoes,
        criterios_saida: campaignData.criterios_saida,
        nom_curso_exclude: campaignData.nom_curso_exclude,
      },
    },
  };

  return {
    // State
    isGenerating,
    error,
    generatedBriefing,
    reviewData,

    // Actions
    handleGenerateBriefing,
    handleBackToBasicInfo,
    clearBriefing,

    // Utility functions
    renderFieldValue,
    getFieldLabel,
  };
};
