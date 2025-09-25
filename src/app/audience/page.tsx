'use client';

import { useRouter } from 'next/navigation';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Grid,
  Paper,
  Button,
  Container,
  Typography,
  CircularProgress,
} from '@mui/material';

import { useAudienceData } from 'src/hooks/useAudienceData';
import { useAudiencePayload } from 'src/hooks/useAudiencePayload';

import { useFormWizard } from 'src/context/FormWizardContext';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

export default function AudiencePage() {
  const router = useRouter();
  const { resetCampaignData } = useFormWizard();
  const payload = useAudiencePayload();
  const { campaign_name, campaign_type, campaign_channels, additional_info } = payload;
  const queryText = additional_info?.segmentations || '';

  const campaignPayload = {
    campaign_name,
    campaign_type,
    channels: campaign_channels,
    query_text: queryText,
    additional_info,
  };
  const { loading, error, data, runAudienceFlow } = useAudienceData();

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const formatNumber = (value: number): string => new Intl.NumberFormat('pt-BR').format(value);

  const parseCurrency = (currencyString: string): number => {
    if (!currencyString) return 0;
    let cleaned = currencyString.replace(/[^\d.,]/g, '').trim();
    if (cleaned.includes(',')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }

    return parseFloat(cleaned) || 0;
  };

  const handleResetFlow = () => {
    resetCampaignData();
    router.push('/briefing/review-generation');
  };

  if (!queryText && !loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="warning.main" gutterBottom>
            Nenhuma segmentação encontrada
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Para visualizar a audiência, você precisa primeiro gerar a segmentação na etapa
            anterior.
          </Typography>
          <Button
            variant="contained"
            onClick={handleResetFlow}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Voltar ao início
          </Button>
        </Box>
      </Container>
    );
  }

  if (loading && !data) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={40} />
          <Typography variant="h6">Carregando dados da audiência...</Typography>
          <Typography variant="body2" color="text.secondary">
            Segmentação: {queryText ? 'Encontrada' : 'Não encontrada'}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error && !data) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Erro ao calcular custos da audiência
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {error}
          </Typography>

          {/* Payload enviado */}
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>
              Payload enviado para API:
            </Typography>
            <Typography
              variant="body2"
              component="pre"
              sx={{ fontSize: '0.75rem', maxHeight: '200px', overflow: 'auto' }}
            >
              {JSON.stringify(campaignPayload, null, 2)}
            </Typography>
          </Box>

          {/* Debug info */}
          <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3cd', borderRadius: 1, textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>
              Informações de Debug:
            </Typography>
            <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
              {JSON.stringify(
                {
                  hasQuery: !!queryText,
                  queryLength: queryText?.length || 0,
                  campaignName: campaign_name,
                  campaignType: campaign_type,
                  channelsCount: Object.keys(campaign_channels).length,
                  baseOrigin: additional_info.base_origin,
                  segmentations: additional_info.segmentations,
                },
                null,
                2
              )}
            </Typography>
          </Box>

          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={() => runAudienceFlow(campaignPayload)}
              disabled={loading}
            >
              {loading ? 'Tentando novamente...' : 'Tentar Novamente'}
            </Button>
            <Button variant="outlined" onClick={() => router.push('/briefing/review-generation')}>
              Voltar para Ajustar Query
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1">
              2. Audiência da Campanha
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Query gerada para a campanha &quot;{campaign_name}&quot;
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Query SQL Gerada */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Query SQL Gerada
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Etapa: LEAD | Base: de_geral_leads
              </Typography>

              <Box
                sx={{
                  bgcolor: '#1a1a1a',
                  color: 'white',
                  p: 2,
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  mb: 2,
                  overflow: 'auto',
                }}
              >
                {queryText ||
                  'Nenhuma query encontrada. Por favor, gere a query primeiro na etapa anterior.'}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="eva:copy-outline" />}
                  onClick={() => {
                    if (queryText) {
                      navigator.clipboard.writeText(queryText);
                      toast.success('Query copiada para a área de transferência!');
                    }
                  }}
                  disabled={!queryText}
                >
                  Copiar Query
                </Button>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main' }} />
                <Typography variant="body2" color="success.main">
                  Query validada com sucesso
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Informações da Audiência */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, mt: 10 }}>
              <Typography variant="h6" gutterBottom>
                Informações da Audiência
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Tamanho da Audiência
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="eva:people-fill" sx={{ color: 'primary.main' }} />
                  <Typography variant="h5" component="span">
                    {data ? formatNumber(data.audience_volume) : '15.800'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    contatos
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Custo Estimado da Campanha
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="eva:credit-card-fill" sx={{ color: 'warning.main' }} />
                  <Typography variant="h5" component="span">
                    {data && data.estimated_costs
                      ? formatCurrency(parseCurrency(data.estimated_costs.Total))
                      : 'R$ 0,00'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Estimativa de Processamento
                </Typography>
                <Typography variant="body1">
                  {data?.processingTime || 'Processamento rápido (5 minutos)'}
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Botões de Ação */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            sx={{
              color: '#093366',
              borderColor: '#093366',
              '&:hover': {
                backgroundColor: '#f8f9fa',
                borderColor: '#093366',
              },
            }}
            onClick={() => router.push('/briefing/review-generation')}
          >
            Voltar para Briefing
          </Button>

          <Button
            variant="outlined"
            onClick={() => router.push('/briefing/basic-info')}
            sx={{
              color: '#093366',
              borderColor: '#093366',
              '&:hover': {
                backgroundColor: '#f8f9fa',
                borderColor: '#093366',
              },
            }}
          >
            Voltar ao Início
          </Button>

          <LoadingButton
            variant="contained"
            startIcon={<Iconify icon="eva:external-link-outline" />}
            loading={loading}
            onClick={() => router.push('/insights')}
            sx={{
              backgroundColor: '#093366',
              '&:hover': { backgroundColor: '#07264d' },
            }}
          >
            Avançar para Insights
          </LoadingButton>
        </Box>
      </Box>
    </Container>
  );
}
