export interface DynamicAdvancedFilterFormValues {
  nom_grupo_marca?: string;
  atl_niveldeensino__c?: string[];
  modalidade?: string[];
  nom_curso?: string[];
  nom_curso_exclude?: string[];
  forma_ingresso_enem?: boolean;
  forma_ingresso_transferencia_externa?: boolean;
  forma_ingresso_vestibular?: boolean;
  forma_ingresso_ingresso_simplificado?: boolean;
  etapa_funil: any[];
  status_vestibular: any[];
  faixa_etaria?: {
    min: number;
    max: number;
  };
  ultima_interacao?: number;
  remover_regua_master?: boolean;
  documentacao_principal_enviada?: boolean;
  atualizacao_automatica?: boolean;
  outras_exclusoes?: string;
  criterios_saida?: string;
  disponibilizacao_call_center_sim?: boolean;
  disponibilizacao_call_center_nao?: boolean;
  informacoes_extras?: string;
  [key: string]: any; // para campos dinâmicos adicionais
}

export interface AdvancedFilterBackendField {
  name: string;
  label: string;
  type: string;
  values?: AdvancedFilterFieldValue[];
  required?: boolean;
  multiple?: boolean;
  has_subfield?: boolean;
  has_search?: boolean;
  placeholder?: string;
  min_value?: number;
  max_value?: number;
  default_value?: any;
}

export interface AdvancedFilterFieldValue {
  id?: number;
  value: string;
  label: string;
  count?: number; // para mostrar quantidade como nos prints (ex: "Gestão De Restaurantes (4146)")
}

export interface AdvancedFilterApiResponse {
  success: boolean;
  code: number;
  data: AdvancedFilterBackendField[];
}

// Interface para campos de range como faixa etária
export interface RangeFieldData {
  min: number;
  max: number;
}

// Interface para campos específicos que podem ter dependências
export interface SearchableField extends AdvancedFilterBackendField {
  has_search: true;
  searchable: true;
  options: AdvancedFilterFieldValue[];
}
