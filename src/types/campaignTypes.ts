// Tipos e dados iniciais para o contexto do formulário de campanha

export interface ChannelWithCost {
  value: string;
  label: string;
  cost: number;
}

export interface RecommendationItem {
  title: string;
  description: string;
  priority?: 'high' | 'medium' | 'low';
  category?: 'content' | 'audience' | 'timing' | 'channel' | 'general';
}

export interface AudienceInfo {
  volumetriaEsperada?: 'Alta' | 'Média' | 'Baixa';
  audienceSize?: number;
  openRate?: number;
  clickRate?: number;
  costPerContact?: number;
  estimatedCampaignCost?: number;
  processingTime?: string;
}

export interface CampaignInsights {
  recommendations?: RecommendationItem[];
}

export interface QueryData {
  etapaFunil: string;
  baseOrigem: string;
  sql: string;
}

export interface CampaignData {
  // Etapa 1: Informações básicas
  channelsWithCosts?: ChannelWithCost[];
  campaignName?: string;
  campaignCode?: string;
  journeyName?: string;
  brand?: string;
  subBrands?: string[];
  offers?: string;
  offer?: string;
  campaignOrigin?: string;
  campaignType?: string;
  campaignObjective?: string;
  dispatchTypes?: string[];
  dispatchQuantities?: Record<string, number>;
  campaignStartDate?: Date;
  campaignEndDate?: Date;
  isContinuous?: boolean;

  // Etapa 2: Público e segmentação
  baseOrigin?: string[];
  source_base?: string;
  source_base_id?: string;
  segmentations?: string[];
  funnelStage?: string[];
  modality?: string[];
  courses?: string[];
  excludedCourses?: string[];
  otherExclusions?: string;
  exitCriteria?: string;
  atl_niveldeensino_c?: string;
  entryForm?: string;
  requiredDocuments?: string[];
  ingressForm?: string;
  allowedEntryForms?: string[];
  excludedEntryForms?: string[];

  // Etapa 3: Avançado/dinâmico
  needsAutomatedUpdate?: string;
  automatedUpdate?: boolean;
  callCenterAvailable?: string;
  callCenterEPS?: string;
  baseSavePath?: string;
  extraInformation?: string;
  // Campos dinâmicos do backend
  nom_grupo_marca?: string;
  status_funil?: string;
  nom_tipo_curso?: string[];
  modalidade?: string[];
  nom_curso?: string[];
  doc_pend?: string[];
  tipo_captacao?: string[];
  status_vestibular?: string;
  interacao_oportunidade?: number;
  documentationSent?: boolean;

  // Etapa 4: Insights, recomendações, etc
  queries?: QueryData[];
  audienceInfo?: AudienceInfo;
  insights?: CampaignInsights;

  // Outros campos
  semester?: string;
  courseLevel?: string[];
  vestibularStatus?: string[];
  ageRange?: [number, number];
  lastInteraction?: number;
  removeFromMasterRegua?: boolean;
  mainDocumentationSent?: boolean;
  [key: string]: any;
}

export const initialCleanCampaignData: CampaignData = {
  campaignName: '',
  campaignCode: '',
  journeyName: '',
  brand: '',
  subBrands: [],
  semester: '',
  offers: '',
  campaignOrigin: 'DE',
  campaignType: '',
  campaignObjective: '',
  funnelStage: [],
  baseOrigin: [],
  modality: [],
  courses: [],
  excludedCourses: [],
  courseLevel: [],
  vestibularStatus: [],
  ageRange: [18, 65],
  lastInteraction: 30,
  removeFromMasterRegua: false,
  mainDocumentationSent: false,
  offer: '',
  allowedEntryForms: [],
  excludedEntryForms: [],
  automatedUpdate: false,
  dispatchTypes: [],
  campaignStartDate: undefined,
  campaignEndDate: undefined,
  queries: [],
  audienceInfo: undefined,
  insights: undefined,
};
