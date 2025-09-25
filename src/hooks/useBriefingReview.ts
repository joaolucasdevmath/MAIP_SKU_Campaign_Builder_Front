import type {
  BriefingPayload,
  BriefingHookReturn,
  BriefingReviewData,
  BriefingApiResponse,
} from 'src/types/briefingTypes';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAudienceData } from 'src/hooks/useAudienceData';

import axiosInstance, { endpoints } from 'src/utils/axios';

import { useFormWizard } from 'src/context/FormWizardContext';

import { toast } from 'src/components/snackbar';

export const useBriefingReview = (): BriefingHookReturn => {
  const { state: campaignData } = useFormWizard();
  const router = useRouter();
  const {
    runAudienceFlow,
    data: audienceData,
    loading: audienceLoading,
    error: audienceError,
  } = useAudienceData();

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

      // Primeiro, calcular custos usando campaign_data - formato correto do backend
      const campaignPayload = {
        campaign_name: campaignData.campaign_name || campaignData.campaignName,
        campaign_type: Array.isArray(campaignData.campaign_type)
          ? campaignData.campaign_type[0]
          : campaignData.campaign_type || campaignData.campaignType,
        channels: { EMAIL: campaignData.quantity_Email || 0 },
        query_text: campaignData.generated_query || campaignData.generatedQuery || '',
        additional_info: {
          base_origin: campaignData.base_origin || campaignData.baseOrigin,
          nom_grupo_marca: campaignData.nom_grupo_marca,
          segmentations: Array.isArray(campaignData.segmentation)
            ? campaignData.segmentation.join(' AND ')
            : campaignData.segmentation || campaignData.segmentations,
          nom_tipo_curso: campaignData.nom_tipo_curso || [],
          tipo_captacao: campaignData.tipo_captacao || [],
          modalidade: campaignData.modalidade || [],
          nom_curso: campaignData.nom_curso || [],
          nom_curso_exclude: campaignData.nom_curso_exclude || [],
          nom_periodo_academico: campaignData.semester || [],
          status_funil: Array.isArray(campaignData.status_funil)
            ? campaignData.status_funil[0]
            : campaignData.status_funil,
          atl_niveldeensino__c: campaignData.atl_niveldeensino__c || [],
          forma_ingresso: campaignData.entryForm || [],
        },
      };

      console.log('📊 Calculando custos com payload:', campaignPayload);
      await runAudienceFlow(campaignPayload);

      if (audienceError) {
        throw new Error(audienceError);
      }

      // Prepare data for API call seguindo o padrão do backend
      const briefingPayload: BriefingPayload = {
        // Informações básicas
        campaign_name: campaignData.campaign_name || campaignData.campaignName,
        campaign_code: campaignData.campaignCode,
        journey_name: campaignData.journeyName,
        brand: campaignData.brand,
        sub_brands: campaignData.subBrands,
        semester: campaignData.semester,
        offers: campaignData.offers,
        campaign_origin: campaignData.campaignOrigin,
        campaign_type: Array.isArray(campaignData.campaign_type)
          ? campaignData.campaign_type[0]
          : campaignData.campaign_type || campaignData.campaignType,
        campaign_objective: campaignData.campaign_objective || campaignData.campaignObjective,
        channel: campaignData.channel,
        offer: campaignData.offer,
        start_date: campaignData.start_date,
        end_date: campaignData.end_date,
        is_continuous: campaignData.is_continuous,
        campaign_codes: campaignData.campaign_codes,
        quantity_Email: campaignData.quantity_Email,
        // Configurações de segmentação
        funnel_stage: campaignData.funnelStage,
        base_origin: campaignData.baseOrigin,
        source_base: campaignData.source_base,
        source_base_id: campaignData.source_base_id,
        segmentation: Array.isArray(campaignData.segmentation)
          ? campaignData.segmentation.join(' AND ')
          : campaignData.segmentation,
        // Configurações avançadas
        modality: campaignData.modalidade,
        courses: campaignData.nom_curso,
        excluded_courses: campaignData.excludedCourses,
        course_level: campaignData.atl_niveldeensino__c,
        vestibular_status: campaignData.vestibularStatus,
        age_range: campaignData.ageRange,
        last_interaction: campaignData.lastInteraction,
        remove_from_master_regua: campaignData.removeFromMasterRegua,
        main_documentation_sent: campaignData.mainDocumentationSent,
        entry_form: campaignData.entryForm,
        allowed_entry_forms: campaignData.allowedEntryForms,
        excluded_entry_forms: campaignData.excludedEntryForms,
        dispatch_types: campaignData.dispatchTypes,
        queries: campaignData.queries?.map((q) => (typeof q === 'string' ? q : JSON.stringify(q))),
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

      // Toast de sucesso
      toast.success('Briefing gerado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar briefing:', err);

      let errorMessage = 'Erro desconhecido ao gerar briefing';

      // Verificar se é erro do backend com mensagem específica
      if (typeof err === 'object' && err !== null && 'errorMessage' in err) {
        errorMessage = `Erro do backend: ${(err as any).errorMessage}`;
      } else if (err instanceof Error) {
        errorMessage = `Erro ao gerar briefing: ${err.message}`;
      }

      setError(errorMessage);
      toast.error(errorMessage);
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
      campaignCode: 'Código da Campanha',
      journeyName: 'Nome da Jornada',
      brand: 'Marca',
      subBrands: 'Sub-marcas',
      semester: 'Semestre',
      offers: 'Ofertas',
      campaignOrigin: 'Origem da Campanha',
      campaignType: 'Tipo de Campanha',
      campaignObjective: 'Objetivo da Campanha',
      channel: 'Canal',
      offer: 'Oferta',
      startDate: 'Data de Início',
      endDate: 'Data de Fim',
      isContinuous: 'Campanha Contínua',
      campaignCodes: 'Códigos da Campanha',
      quantityEmail: 'Quantidade de Emails',

      // Segmentação
      sourceBase: 'Base de Origem',
      segmentation: 'Segmentação',
      funnelStage: 'Estágio do Funil',
      baseOrigin: 'Origem da Base',
      modalidade: 'Modalidade',
      courses: 'Cursos',
      excludedCourses: 'Cursos Excluídos',
      courseLevel: 'Nível do Curso',
      nom_curso: 'Cursos (Nome)',
      nom_curso_exclude: 'Cursos Excluídos (Nome)',
      atl_niveldeensino_c: 'Nível de Ensino',
      vestibularStatus: 'Status do Vestibular',
      ageRange: 'Faixa Etária',
      lastInteraction: 'Última Interação (dias)',
      removeFromMasterRegua: 'Remover da Régua Master',
      mainDocumentationSent: 'Documentação Principal Enviada',
      dispatchTypes: 'Tipos de Disparo',
      queries: 'Consultas',
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
        campaignCode: campaignData.campaignCode,
        journeyName: campaignData.journeyName,
        brand: campaignData.brand,
        subBrands: campaignData.subBrands,
        semester: campaignData.semester,
        offers: campaignData.offers,
        campaignOrigin: campaignData.campaignOrigin,
        campaignType: campaignData.campaign_type || campaignData.campaignType,
        campaignObjective: campaignData.campaign_objective || campaignData.campaignObjective,
        channel: campaignData.channel,
        offer: campaignData.offer,
        startDate: campaignData.start_date,
        endDate: campaignData.end_date,
        isContinuous: campaignData.is_continuous,
        campaignCodes: campaignData.campaign_codes,
        quantityEmail: campaignData.quantity_Email,
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
        courses: campaignData.courses,
        excludedCourses: campaignData.excludedCourses,
        courseLevel: campaignData.courseLevel,
        nom_curso_exclude: campaignData.nom_curso_exclude,
        atl_niveldeensino_c: campaignData.atl_niveldeensino__c,
        vestibularStatus: campaignData.vestibularStatus,
        ageRange: campaignData.ageRange,
        lastInteraction: campaignData.lastInteraction,
        removeFromMasterRegua: campaignData.removeFromMasterRegua,
        mainDocumentationSent: campaignData.mainDocumentationSent,
        entryForm: campaignData.entryForm,
        allowedEntryForms: campaignData.allowedEntryForms,
        excludedEntryForms: campaignData.excludedEntryForms,
        dispatchTypes: campaignData.dispatchTypes,
        queries: campaignData.queries,
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
