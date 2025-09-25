import { useFormWizard } from 'src/context/FormWizardContext';

export function useAudiencePayload() {
  const { state: campaignData } = useFormWizard();
  console.log('[DEBUG useAudiencePayload] campaignData:', campaignData);

  let campaign_channels: Record<string, number> = {};
  if (campaignData && Array.isArray(campaignData.channel)) {
    campaignData.channel.forEach((channel: string) => {
      const key = `quantity_${channel}`;
      const value = campaignData[key];
      if (
        value !== undefined &&
        value !== null &&
        !Number.isNaN(Number(value)) &&
        Number(value) > 0
      ) {
        campaign_channels[channel.toUpperCase()] = Number(value);
      }
    });
  }
  // Fallback para EMAIL se não houver canais
  const qEmail = campaignData.quantity_Email || campaignData.quantity_email;
  if (Object.keys(campaign_channels).length === 0 && qEmail !== undefined && Number(qEmail) > 0) {
    campaign_channels = { EMAIL: Number(qEmail) };
  }

  const campaignName = campaignData.campaign_name || campaignData.campaignName || '';
  const campaignType = Array.isArray(campaignData.campaign_type)
    ? campaignData.campaign_type[0]
    : campaignData.campaign_type || campaignData.campaignType || '';
  const channels = campaign_channels;
  const queryText = campaignData.generated_query || campaignData.generatedQuery || '';

  const additionalInfo = {
    base_origin: String(
      Array.isArray(campaignData.base_origin)
        ? campaignData.base_origin[0] || ''
        : campaignData.base_origin || campaignData.baseOrigin || ''
    ).toUpperCase(),
    nom_grupo_marca: campaignData.nom_grupo_marca || campaignData.brand || '',
    segmentations: Array.isArray(campaignData.segmentations)
      ? campaignData.segmentations.join(' AND ')
      : campaignData.segmentations || campaignData.segmentation || '',
    nom_tipo_curso: Array.isArray(campaignData.nom_tipo_curso) ? campaignData.nom_tipo_curso : [],
    tipo_captacao: Array.isArray(campaignData.tipo_captacao) ? campaignData.tipo_captacao : [],
    modalidade: Array.isArray(campaignData.modalidade) ? campaignData.modalidade : [],
    nom_curso: Array.isArray(campaignData.nom_curso) ? campaignData.nom_curso : [],
    nom_curso_exclude: Array.isArray(campaignData.nom_curso_exclude)
      ? campaignData.nom_curso_exclude
      : [],
    nom_periodo_academico: Array.isArray(campaignData.nom_periodo_academico)
      ? campaignData.nom_periodo_academico
      : [],
    status_funil: Array.isArray(campaignData.status_funil)
      ? campaignData.status_funil.length === 1
        ? String(campaignData.status_funil[0])
        : campaignData.status_funil.join(', ')
      : campaignData.status_funil || campaignData.funnelStage || '',
    atl_niveldeensino__c: Array.isArray(campaignData.atl_niveldeensino__c)
      ? campaignData.atl_niveldeensino__c
      : [],
    forma_ingresso: Array.isArray(campaignData.forma_ingresso) ? campaignData.forma_ingresso : [],
  };

  const campaignPayload = {
    campaign_name: campaignName,
    campaign_type: campaignType,
    campaign_channels: channels,
    query_text: queryText,
    additional_info: additionalInfo,
  };

  return campaignPayload;
}
