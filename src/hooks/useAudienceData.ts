import { useState } from 'react';

import axiosInstance, { endpoints } from 'src/utils/axios';

interface CampaignDataPayload {
	campaign_name: string;
	campaign_type: string;
	channels: Record<string, number>;
	additional_info: Record<string, any>;
}

interface UseAudienceDataResult {
	loading: boolean;
	error: string | null;
	data: any;
	runAudienceFlow: (campaignPayload: CampaignDataPayload) => Promise<void>;
}

export function useAudienceData(): UseAudienceDataResult {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [data, setData] = useState<any>(null);

	
		const runAudienceFlow = async (campaignPayload: CampaignDataPayload) => {
			setLoading(true);
			setError(null);
			setData(null);
			try {
				console.log('Payload enviado para API (campaign_data):', campaignPayload);
				const campaignRes = await axiosInstance.post(endpoints.briefing.campaignData, campaignPayload);
				console.log('Resposta completa da API:', campaignRes.data);
				if (campaignRes.data?.success === false) {
					let errorMsg = campaignRes.data?.errorMessage || 'Erro na API';
					if (errorMsg.includes('invalid literal for int()') || errorMsg.includes('falha ao executar')) {
						errorMsg = 'Erro ao executar a query: A consulta não pôde ser processada. Verifique os filtros e tente novamente.';
					} else if (errorMsg.includes('Não foi possível executar')) {
						errorMsg = 'Erro ao contar audiência: A query falhou na execução. Revise os parâmetros da segmentação.';
					}
					setError(errorMsg);
				} else if (campaignRes.data?.data) {
					setData(campaignRes.data.data);
				} else {
					setData(campaignRes.data);
				}
			} catch (err: any) {
				let errorMsg = err?.response?.data?.errorMessage || err.message || 'Erro desconhecido';
				if (errorMsg.includes('invalid literal for int()') || errorMsg.includes('falha ao executar')) {
					errorMsg = 'Erro ao processar resposta da API: Problema na execução da query. Tente ajustar os filtros.';
				} else if (errorMsg.includes('500')) {
					errorMsg = 'Erro interno do servidor ao calcular custos. Verifique se a query é válida.';
				}
				setError(errorMsg);
			} finally {
				setLoading(false);
			}
		};

	return { loading, error, data, runAudienceFlow };
}
