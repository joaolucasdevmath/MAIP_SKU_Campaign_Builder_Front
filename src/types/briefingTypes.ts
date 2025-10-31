export interface GenerateQueryPayload {
  campaign_name: string;
  campaign_type: string;
  campaign_objective: string;
  campaign_channels: string[];
  filters: Record<string, any>;
}

export interface GenerateQueryResponse {
  success: boolean;
  errorMessage?: string;
  code: number;
  data?: string | { query_text: string };
}

// Interfaces para Campaign Data API
export interface ChannelInfo {
  quantity: number;
  cost: number;
}

export interface CampaignDataPayload {
  campaign_name: string;
  campaign_type: string;
  additional_info: {
    brand?: string;
    modality?: string;
    courses?: string;
    education_level?: string;
    entry_forms?: string;
    segmentation?: string;
    age_range?: string;
    last_interaction?: number;
    campaign_start_date?: string;
    campaign_end_date?: string;
    campaign_objective?: string;
    [key: string]: any;
  };
  query_text: string;
  channels: Record<string, ChannelInfo>;
}

export interface CampaignDataResponse {
  success: boolean;
  errorMessage?: string;
  code: number;
  data?: {
    // Campos originais (para compatibilidade)
    audience_size?: number;
    estimated_cost?: number;
    processing_time?: string;
    cost_breakdown?: Record<string, number>;
    audience_info?: Record<string, any>;

    // Novos campos da API real
    audience_volume?: number;
    estimated_costs?: Record<string, string>;
    journey_name?: string;
  };
}

export interface BriefingPayload {
  // Informações básicas
  campaign_name?: string;
  campaign_code?: string;
  journey_name?: string;
  brand?: string;
  sub_brands?: string[];
  semester?: string;
  offers?: string;
  campaign_origin?: string;
  campaign_type?: string[];
  campaign_objective?: string[];
  channel?: string[];
  offer?: string;
  start_date?: string;
  end_date?: string;
  is_continuous?: boolean;
  campaign_codes?: string;
  quantity_Email?: number;
  // Configurações de segmentação
  funnel_stage?: string[];
  base_origin?: string[];
  source_base?: string;
  source_base_id?: string;
  segmentation?: string[];
  // Configurações avançadas
  modality?: string[];
  courses?: string[];
  excluded_courses?: string[];
  course_level?: string[];
  vestibular_status?: string[];
  age_range?: number[];
  last_interaction?: number;
  remove_from_master_regua?: boolean;
  main_documentation_sent?: boolean;
  entry_form?: string;
  allowed_entry_forms?: string[];
  excluded_entry_forms?: string[];
  dispatch_types?: string[];
  queries?: string[];
  automated_update?: boolean;
  call_center_available?: string;
  call_center_eps?: string;
  extra_information?: string;
  // Campos dinâmicos do backend
  nom_grupo_marca?: string;
  status_funil?: string;
  nom_tipo_curso?: string[];
  doc_pend?: string[];
  tipo_captacao?: string[];
  status_vestibular?: string;
  interacao_oportunidade?: number;
  documentation_sent?: boolean;
  outras_exclusoes?: string;
  criterios_saida?: string;
  forma_ingresso_enem?: boolean;
  forma_ingresso_transferencia_externa?: boolean;
  forma_ingresso_vestibular?: boolean;
  forma_ingresso_ingresso_simplificado?: boolean;
  [key: string]: any;
}

export interface BriefingApiResponse {
  briefing?: string;
  message?: string;
  success?: boolean;
  error?: string;
}

export interface BriefingState {
  isGenerating: boolean;
  error: string | null;
  generatedBriefing: string | null;
}

export interface BriefingActions {
  handleGenerateBriefing: () => Promise<void>;
  handleBackToBasicInfo: () => void;
  clearBriefing: () => void;
}

export interface ReviewSectionData {
  title: string;
  data: Record<string, any>;
}

export interface BriefingReviewData {
  basicInfo: ReviewSectionData;
  segmentation: ReviewSectionData;
  advancedFilters: ReviewSectionData;
}

export interface BriefingHookReturn extends BriefingState, BriefingActions {
  reviewData: BriefingReviewData;
  renderFieldValue: (value: any) => string;
  getFieldLabel: (key: string) => string;
}

export interface BriefingData {
  basicInfo: Record<string, any>;
  segmentation: Record<string, any>;
  advanced: Record<string, any>;
}

export interface UseBriefingReviewReturn extends BriefingState, BriefingActions {
  briefingData: BriefingData;
  renderFieldValue: (value: any) => string;
  getFieldLabel: (key: string) => string;
  campaignData: any;
}
