export interface ChannelInfo {
  quantity: number;
  cost: number;
}

export interface CampaignDataPayload {
  campaign_name: string;
  campaign_type: string;
  channels: Record<string, ChannelInfo>;
  query_text: string;
  additional_info: {
    base_origin: string;
    nom_grupo_marca: string;
    segmentations: string;
    nom_tipo_curso: string[];
    tipo_captacao: string[];
    modalidade: string[];
    nom_curso: string[];
    nom_curso_exclude: string[];
    nom_periodo_academico: string[];
    status_funil: string[];
    atl_niveldeensino_c: string[];
    forma_ingresso: string[];
  };
}