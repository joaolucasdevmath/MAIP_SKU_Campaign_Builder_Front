export interface BriefingPayload {
  campaign_name?: string;
  brand?: string;
  sub_brands?: string[];
  campaign_origin?: string;
  campaign_type?: string[];
  campaign_objective?: string[];
  funnel_stage?: string[];
  base_origin?: string[];
  modality?: string[];
  courses?: string[];
  course_level?: string[];
  entry_form?: string;
  allowed_entry_forms?: string[];
  excluded_entry_forms?: string[];
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
  // Campos adicionais do backend
  source_base?: string;
  source_base_id?: string;
  segmentation?: string[];
  channel?: string[];
  offer?: string;
  start_date?: string;
  end_date?: string;
  is_continuous?: boolean;
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
