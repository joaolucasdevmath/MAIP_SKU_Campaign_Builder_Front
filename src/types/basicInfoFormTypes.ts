export interface ChannelOption {
  label: string;
}

export interface BasicInfoFormValues {
  campaignName: string;
  campaignType: string;
  campaignObjective: string;
  offer: string;
  campaignCode?: string;
  channel: ChannelOption | null;
  quantity: string;
  startDate: unknown;
  endDate: unknown;
  isContinuous: boolean;
}
