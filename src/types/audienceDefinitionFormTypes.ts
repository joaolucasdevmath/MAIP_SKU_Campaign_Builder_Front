export interface DynamicAudienceFormValues {
  source_base: string;
  segmentation?: string[];
  [key: string]: any;
}

export interface AudienceBackendField {
  name: string;
  label: string;
  type: string;
  values?: AudienceFieldValue[];
  required?: boolean;
  multiple?: boolean;
  has_subfield?: boolean;
  placeholder?: string;
}

export interface AudienceFieldValue {
  ids: number;
  value: string;
  label: string;
}

export interface SegmentationValue {
  value: string;
  label: string;
}

export interface AudienceApiResponse {
  success: boolean;
  code: number;
  data: AudienceBackendField[];
}

export interface SegmentationApiResponse {
  success: boolean;
  code: number;
  data: AudienceFieldValue[];
}