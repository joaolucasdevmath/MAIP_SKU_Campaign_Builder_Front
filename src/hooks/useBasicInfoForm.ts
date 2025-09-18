import type { BasicInfoFormValues } from 'src/types/basicInfoFormTypes';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { basicInfoSchema } from 'src/utils/schemas/basicInfoSchema';

export function useBasicInfoForm(state: Partial<BasicInfoFormValues>) {
  return useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      campaignName: state.campaignName || '',
      campaignType: state.campaignType || '',
      campaignObjective: state.campaignObjective || '',
      offer: state.offer || '',
      campaignCode: state.campaignCode || '',
      channel: state.channel || null,
      quantity: state.quantity || '',
      startDate: state.startDate || null,
      endDate: state.endDate || null,
      isContinuous: state.isContinuous || false,
    },
    mode: 'onSubmit',
  });
}
