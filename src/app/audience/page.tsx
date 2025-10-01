'use client';

import { useEffect } from 'react';
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
  
} from '@mui/material';

import { useAudienceData } from 'src/hooks/useAudienceData';
import { useAudienceQuery } from 'src/hooks/useAudienceQuery';
import { useBriefingReview } from 'src/hooks/useBriefingReview';
import { useAudiencePayload } from 'src/hooks/useAudiencePayload';

import { useFormWizard } from 'src/context/FormWizardContext';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { SplashScreen } from 'src/components/loading-screen';

export default function AudiencePage() {
  const router = useRouter();
  const { resetCampaignData } = useFormWizard();
  const payload = useAudiencePayload();
  const { loading, error, data, runAudienceFlow } = useAudienceData();
  const { clearAllData } = useAudienceQuery();
  const { handleBackToBasicInfo } = useBriefingReview();

  useEffect(() => {
    console.log('[AudiencePage] Payload recebido:', JSON.stringify(payload, null, 2));
    console.log('[AudiencePage] Estado atual:', { loading, error, data });
    if (payload.query_text && !data && !loading && !error) {
      console.log('[AudiencePage] Chamando runAudienceFlow...');
      runAudienceFlow(payload);
    }
  }, [payload, data, loading, error, runAudienceFlow]);

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
    console.log('[AudiencePage] Iniciando reset do fluxo...');
    resetCampaignData();
    console.log('[AudiencePage] Estado limpo com resetCampaignData.');
    router.push('/briefing/review-generation');
  };

  if (!payload.query_text && !loading) {
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
        <Box sx={{ py: 4, minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <SplashScreen portal={false} />
          
          <Typography variant="body2" color="text.secondary" align="center">
            Segmentação: {payload.query_text ? 'Encontrada' : 'Não encontrada'}
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

          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>
              Payload enviado para API:
            </Typography>
            <Typography
              variant="body2"
              component="pre"
              sx={{ fontSize: '0.75rem', maxHeight: '200px', overflow: 'auto' }}
            >
              {JSON.stringify(payload, null, 2)}
            </Typography>
          </Box>

          <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3cd', borderRadius: 1, textAlign: 'left' }}>
            <Typography variant="subtitle2" gutterBottom>
              Informações de Debug:
            </Typography>
            <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
              {JSON.stringify(
                {
                  hasQuery: !!payload.query_text,
                  queryLength: payload.query_text?.length || 0,
                  campaignName: payload.campaign_name,
                  campaignType: payload.campaign_type,
                  channels: payload.channels,
                  baseOrigin: payload.additional_info.base_origin,
                  segmentations: payload.additional_info.segmentations,
                },
                null,
                2
              )}
            </Typography>
          </Box>

          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" onClick={() => runAudienceFlow(payload)} disabled={loading}>
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
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box>
           <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#000' }}>
              2. Audiência da Campanha
            </Typography>
           
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Query SQL Gerada
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Etapa:{' '}
                {payload.additional_info.base_origin === 'DE_GERAL_LEADS' ? 'LEAD' : 'OPORTUNIDADE'}{' '}
                | Base: {payload.additional_info.base_origin}
              </Typography>

              {/*
              // --- BLOCO ORIGINAL ---
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
                {payload.query_text ||
                  'Nenhuma query encontrada. Por favor, gere a query primeiro na etapa anterior.'}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="eva:copy-outline" />}
                  onClick={() => {
                    if (payload.query_text) {
                      navigator.clipboard.writeText(payload.query_text);
                      toast.success('Query copiada para a área de transferência!');
                    }
                  }}
                  disabled={!payload.query_text}
                >
                  Copiar Query
                </Button>
              </Box>
              // --- FIM BLOCO ORIGINAL ---
              */}

              {/* --- BLOCO COM MÁSCARA --- */}
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
                {payload.query_text
                  ? payload.query_text.replace(/(nom_grupo_marca\s*=\s*')([^']*)(')/g, '$1MARCA$3')
                  : 'Nenhuma query encontrada. Por favor, gere a query primeiro na etapa anterior.'}
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="eva:copy-outline" />}
                  onClick={() => {
                    if (payload.query_text) {
                      const masked = payload.query_text.replace(/(nom_grupo_marca\s*=\s*')([^']*)(')/g, '$1MARCA$3');
                      navigator.clipboard.writeText(masked);
                      toast.success('Query copiada para a área de transferência!');
                    }
                  }}
                  disabled={!payload.query_text}
                >
                  Copiar Query
                </Button>
              </Box>
              {/* --- FIM BLOCO COM MÁSCARA --- */}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main' }} />
                <Typography variant="body2" color="success.main">
                  Query validada com sucesso
                </Typography>
              </Box>
            </Paper>
          </Grid>

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
                  <Iconify icon="eva:people-fill" sx={{ color: '#093366' }} />
                  <Typography variant="h5" component="span">
                    {data && data.audience_volume ? formatNumber(data.audience_volume) : '0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    contatos
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Canais Utilizados
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {Object.entries(payload.channels).map(([channel, quantity]) => (
                    <Typography key={channel} variant="body2">
                      {channel}: {formatNumber(quantity)}
                    </Typography>
                  ))}
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Custo Estimado da Campanha
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Iconify icon="eva:credit-card-fill" sx={{ color: '#093366' }} />
                  <Typography variant="h5" component="span">
                    {data && data.estimated_costs && data.estimated_costs.Total
                      ? formatCurrency(parseCurrency(data.estimated_costs.Total))
                      : 'R$ 0,00'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Estimativa de Processamento
                </Typography>
                <Typography variant="body1">Processamento rápido (5 minutos)</Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

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
            type="button"
            onClick={() => {
              console.log('[AudiencePage] Iniciando voltar ao início...');
              console.log('[AudiencePage] Estado antes do reset:', JSON.stringify(payload, null, 2));
              clearAllData();
              handleBackToBasicInfo();
              toast.success('Fluxo reiniciado com sucesso!');
              console.log('[AudiencePage] Estado limpo com clearAllData e handleBackToBasicInfo.');
            }}
            disabled={loading}
            sx={{
              color: '#093366',
              backgroundColor: 'white',
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