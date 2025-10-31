import { useFormWizard } from 'src/context/FormWizardContext';

export function useAudiencePayload() {
  const { state: campaignData } = useFormWizard();
  console.log('[DEBUG useAudiencePayload] campaignData:', JSON.stringify(campaignData, null, 2));

  // Construir campaign_channels dinamicamente
  const campaign_channels: Record<string, { quantity: number; cost: number }> = {};
  if (campaignData && Array.isArray(campaignData.channel)) {
    campaignData.channel.forEach((channel: string) => {
      const channelKeyUpper = channel.toUpperCase();
      const channelKeyOriginal = channel;
      const quantityKeys = [
        `quantity_${channelKeyUpper}`,
        `quantity_${channelKeyOriginal}`,
        `quantity_${channelKeyOriginal.toLowerCase()}`,
      ];
      let quantity: any;
      // eslint-disable-next-line no-restricted-syntax
      for (const quantityKey of quantityKeys) {
        quantity = campaignData[quantityKey];
        console.log(
          `[DEBUG useAudiencePayload] Processando canal: ${channel}, quantityKey: ${quantityKey}, quantity: ${quantity}`
        );
        if (
          quantity !== undefined &&
          quantity !== null &&
          !Number.isNaN(Number(quantity)) &&
          Number(quantity) > 0
        ) {
          // Encontrar o custo do canal
          const channelInfo = campaignData.channelsWithCosts?.find(
            (c: any) => c.value.toUpperCase() === channelKeyUpper
          );
          
          if (channelInfo) {
            campaign_channels[channelKeyUpper] = {
              quantity: Number(quantity),
              cost: Number(channelInfo.cost || 0)
            };
          }
          break;
        }
      }
      if (!campaign_channels[channelKeyUpper]) {
        console.warn(
          `[DEBUG useAudiencePayload] Canal ${channel} ignorado: valor inválido (${quantity})`
        );
      }
    });
  }

  // Validação de campaign_channels
  if (Object.keys(campaign_channels).length === 0) {
    console.warn('[useAudiencePayload] Nenhum canal válido encontrado em campaign_channels');
  } else {
    console.log(
      '[DEBUG useAudiencePayload] Canais construídos:',
      JSON.stringify(campaign_channels, null, 2)
    );
  }

  const campaignName = campaignData.campaign_name || campaignData.campaignName || 'teste';
  const campaignType = Array.isArray(campaignData.campaign_type)
    ? campaignData.campaign_type[0] || 'CAPTAÇÃO'
    : campaignData.campaign_type || campaignData.campaignType || 'CAPTAÇÃO';
  const queryText = campaignData.generated_query || campaignData.generatedQuery || '';

  // Determinar nom_periodo_academico com base no base_origin
  const baseOrigin = String(
    Array.isArray(campaignData.base_origin)
      ? campaignData.base_origin[0] || ''
      : campaignData.base_origin || campaignData.baseOrigin || ''
  ).toUpperCase();
  const nom_periodo_academico =
    baseOrigin === 'DE_GERAL_LEADS'
      ? []
      : Array.isArray(campaignData.nom_periodo_academico)
        ? campaignData.nom_periodo_academico
        : ['2025.1'];

  const additionalInfo = {
    base_origin: baseOrigin,
    nom_grupo_marca: campaignData.nom_grupo_marca || campaignData.brand || '',
    segmentations: Array.isArray(campaignData.segmentation)
      ? campaignData.segmentation.join(' AND ')
      : String(campaignData.segmentation || campaignData.segmentations || ''),
    nom_tipo_curso: Array.isArray(campaignData.nom_tipo_curso) ? campaignData.nom_tipo_curso : [],
    tipo_captacao: Array.isArray(campaignData.tipo_captacao) ? campaignData.tipo_captacao : [],
    modalidade: [],
    nom_curso: Array.isArray(campaignData.nom_curso) ? campaignData.nom_curso : [],
    nom_curso_exclude: Array.isArray(campaignData.nom_curso_exclude)
      ? campaignData.nom_curso_exclude
      : [],
    nom_periodo_academico,
    status_funil: Array.isArray(campaignData.status_funil)
      ? campaignData.status_funil
      : campaignData.status_funil || [],
    atl_niveldeensino__c: [],
    forma_ingresso: Array.isArray(campaignData.forma_ingresso)
      ? campaignData.forma_ingresso
      : Array.isArray(campaignData.entryForm)
        ? campaignData.entryForm
        : [],
  };

  const campaignPayload = {
    campaign_name: campaignName,
    campaign_type: campaignType,
    channels: campaign_channels,
    query_text: queryText,
    additional_info: additionalInfo,
  };

  console.log(
    '[DEBUG useAudiencePayload] campaignPayload:',
    JSON.stringify(campaignPayload, null, 2)
  );

  return campaignPayload;
}
