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
  console.log('🔍 Debug campaignData no hook:', JSON.stringify(campaignData, null, 2));

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedBriefing, setGeneratedBriefing] = useState<string | null>(null);

  const handleGenerateBriefing = async (): Promise<void> => {
    try {
      setIsGenerating(true);
      setError(null);

      // Construir channels dinamicamente
      const campaign_channels: Record<string, number> = {};
      if (Array.isArray(campaignData.channel)) {
        campaignData.channel.forEach((channel: string) => {
          // Tentar com channelKey em maiúsculo e original
          const channelKeyUpper = channel.toUpperCase();
          const channelKeyOriginal = channel;
          const quantityKeys = [
            `quantity_${channelKeyUpper}`,
            `quantity_${channelKeyOriginal}`,
            `quantity_${channelKeyOriginal.toLowerCase()}`,
          ];
          let value: any;
          // eslint-disable-next-line no-restricted-syntax
          for (const quantityKey of quantityKeys) {
            value = campaignData[quantityKey];
            console.log(`[DEBUG useBriefingReview] Processando canal: ${channel}, quantityKey: ${quantityKey}, value: ${value}`);
            if (
              value !== undefined &&
              value !== null &&
              !Number.isNaN(Number(value)) &&
              Number(value) > 0
            ) {
              campaign_channels[channelKeyUpper] = Number(value);
              break;
            }
          }
          if (!campaign_channels[channelKeyUpper]) {
            console.warn(`[DEBUG useBriefingReview] Canal ${channel} ignorado: valor inválido (${value})`);
          }
        });
      }

      // Validação de channels
      if (Object.keys(campaign_channels).length === 0) {
        console.warn('[DEBUG useBriefingReview] Nenhum canal válido encontrado em campaign_channels');
      } else {
        console.log('[DEBUG useBriefingReview] Canais construídos:', JSON.stringify(campaign_channels, null, 2));
      }

      // Campos de lista: manter como array (vazio [] ou preenchido)
      // Campos single: string
      const additionalInfo = {
        base_origin: String(
          Array.isArray(campaignData.base_origin)
            ? campaignData.base_origin[0] || ''
            : campaignData.base_origin || campaignData.baseOrigin || ''
        ).toUpperCase(),
        nom_grupo_marca: campaignData.nom_grupo_marca || campaignData.brand || '',
        segmentations: Array.isArray(campaignData.segmentation)
          ? campaignData.segmentation.join(' AND ')
          : String(campaignData.segmentation || campaignData.segmentations || ''),
        nom_tipo_curso: Array.isArray(campaignData.nom_tipo_curso) ? campaignData.nom_tipo_curso : [],
        tipo_captacao: Array.isArray(campaignData.tipo_captacao) ? campaignData.tipo_captacao : [],
        modalidade: Array.isArray(campaignData.modalidade) ? campaignData.modalidade : [],
        nom_curso: Array.isArray(campaignData.nom_curso) ? campaignData.nom_curso : [],
        nom_curso_exclude: Array.isArray(campaignData.nom_curso_exclude) ? campaignData.nom_curso_exclude : [],
        nom_periodo_academico: Array.isArray(campaignData.nom_periodo_academico) ? campaignData.nom_periodo_academico : Array.isArray(campaignData.semester) ? campaignData.semester : [],
        status_funil: Array.isArray(campaignData.status_funil)
          ? campaignData.status_funil.length === 1
            ? String(campaignData.status_funil[0])
            : campaignData.status_funil.join(', ')
          : String(campaignData.status_funil || ''),
        atl_niveldeensino__c: Array.isArray(campaignData.atl_niveldeensino__c) ? campaignData.atl_niveldeensino__c : [],
        forma_ingresso: Array.isArray(campaignData.forma_ingresso) ? campaignData.forma_ingresso : Array.isArray(campaignData.entryForm) ? campaignData.entryForm : [],
      };

      // Construir campaignPayload para runAudienceFlow
      const campaignPayload = {
        campaign_name: campaignData.campaign_name || campaignData.campaignName || 'teste',
        campaign_type: Array.isArray(campaignData.campaign_type)
          ? campaignData.campaign_type[0] || 'CAPTAÇÃO'
          : campaignData.campaign_type || campaignData.campaignType || 'CAPTAÇÃO',
        channels: campaign_channels,
        query_text: campaignData.generated_query || campaignData.generatedQuery || '',
        additional_info: additionalInfo,
      };

      console.log('📊 Calculando custos com payload:', JSON.stringify(campaignPayload, null, 2));
      await runAudienceFlow(campaignPayload);

      if (audienceError) {
        throw new Error(audienceError);
      }

      // Prepare data for API call seguindo o padrão do backend
      const briefingPayload: BriefingPayload = {
        campaign_name: campaignData.campaign_name || campaignData.campaignName || 'teste',
        campaign_code: campaignData.campaignCode || '',
        journey_name: campaignData.journeyName || '',
        brand: campaignData.brand || '',
        sub_brands: campaignData.subBrands || [],
        semester: campaignData.semester || '',
        offers: campaignData.offers || '',
        campaign_origin: campaignData.campaignOrigin || '',
        campaign_type: Array.isArray(campaignData.campaign_type)
          ? campaignData.campaign_type[0] || 'CAPTAÇÃO'
          : campaignData.campaign_type || campaignData.campaignType || 'CAPTAÇÃO',
        campaign_objective: Array.isArray(campaignData.campaign_objective)
          ? campaignData.campaign_objective[0] || 'INSCRIÇÃO'
          : campaignData.campaign_objective || campaignData.campaignObjective || 'INSCRIÇÃO',
        channel: campaignData.channel || [],
        offer: campaignData.offer || '',
        start_date: campaignData.start_date || '',
        end_date: campaignData.end_date || '',
        is_continuous: campaignData.is_continuous || false,
        campaign_codes: campaignData.campaign_codes || '',
        quantity_Email: campaignData.quantity_Email || 0,
        funnel_stage: campaignData.funnelStage || [],
        base_origin: campaignData.baseOrigin || campaignData.base_origin || [],
        source_base: campaignData.source_base || '',
        source_base_id: campaignData.source_base_id || '',
        segmentation: Array.isArray(campaignData.segmentation)
          ? campaignData.segmentation.join(' AND ')
          : campaignData.segmentation || '',
        modality: campaignData.modalidade || [],
        courses: campaignData.nom_curso || campaignData.courses || [],
        excluded_courses: campaignData.excludedCourses || campaignData.nom_curso_exclude || [],
        course_level: campaignData.atl_niveldeensino__c || campaignData.courseLevel || [],
        vestibular_status: campaignData.vestibularStatus || campaignData.status_vestibular || [],
        age_range: campaignData.ageRange || [],
        last_interaction: campaignData.lastInteraction || 0,
        remove_from_master_regua: campaignData.removeFromMasterRegua || false,
        main_documentation_sent: campaignData.mainDocumentationSent || false,
        entry_form: campaignData.entryForm || campaignData.forma_ingresso || [],
        allowed_entry_forms: campaignData.allowedEntryForms || [],
        excluded_entry_forms: campaignData.excludedEntryForms || [],
        dispatch_types: campaignData.dispatchTypes || [],
        queries: campaignData.queries?.map((q) => (typeof q === 'string' ? q : JSON.stringify(q))) || [],
        automated_update: campaignData.automatedUpdate || false,
        call_center_available: campaignData.disponibilizacao_call_center_sim
          ? 'Sim'
          : campaignData.disponibilizacao_call_center_nao
            ? 'Não'
            : undefined,
        call_center_eps: campaignData.callCenterEPS || '',
        extra_information: campaignData.informacoes_extras || campaignData.extraInformation || '',
        nom_grupo_marca: campaignData.nom_grupo_marca || '',
        status_funil: campaignData.status_funil || '',
        nom_tipo_curso: campaignData.nom_tipo_curso || [],
        doc_pend: campaignData.doc_pend || '',
        tipo_captacao: campaignData.tipo_captacao || [],
        status_vestibular: campaignData.status_vestibular || '',
        interacao_oportunidade: campaignData.interacao_oportunidade || '',
        documentation_sent: campaignData.documentationSent || false,
        outras_exclusoes: campaignData.outras_exclusoes || '',
        criterios_saida: campaignData.criterios_saida || '',
        forma_ingresso_enem: campaignData.forma_ingresso_enem || false,
        forma_ingresso_transferencia_externa: campaignData.forma_ingresso_transferencia_externa || false,
        forma_ingresso_vestibular: campaignData.forma_ingresso_vestibular || false,
        forma_ingresso_ingresso_simplificado: campaignData.forma_ingresso_ingresso_simplificado || false,
      };

      console.log('🚀 Enviando payload para API:', JSON.stringify(briefingPayload, null, 2));

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

  const reviewData: BriefingReviewData = {
    basicInfo: {
      title: '1. Informações Básicas',
      data: {
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
        forma_ingresso_enem: campaignData.forma_ingresso_enem,
        forma_ingresso_transferencia_externa: campaignData.forma_ingresso_transferencia_externa,
        forma_ingresso_vestibular: campaignData.forma_ingresso_vestibular,
        forma_ingresso_ingresso_simplificado: campaignData.forma_ingresso_ingresso_simplificado,
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
    isGenerating,
    error,
    generatedBriefing,
    reviewData,
    handleGenerateBriefing,
    handleBackToBasicInfo,
    clearBriefing,
    renderFieldValue,
    getFieldLabel,
  };
};