'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Chip,
  Grid,
  Paper,
  Stack,
  Button,
  Divider,
  Container,
  Typography,
  CardContent,
  CircularProgress,

} from '@mui/material';

import { useAudienceQuery } from 'src/hooks/useAudienceQuery';
import { useBriefingReview } from 'src/hooks/useBriefingReview';

import { toast } from 'src/components/snackbar';
import { FormStepper } from 'src/components/form-stepper/FormStepper';

export default function ReviewGeneration() {
  
  const router = useRouter();
  const {
    isGenerating,
    
    generatedBriefing,
    reviewData,
    handleGenerateBriefing,
    handleBackToBasicInfo,
    renderFieldValue,
    getFieldLabel,
  } = useBriefingReview();

  const {
    isGenerating: isGeneratingQuery,
    generatedQuery,
    handleGenerateQuery,
    handleSaveAsDraft,
    clearAllData,
  } = useAudienceQuery();

  const renderSection = (title: string, data: Record<string, any>) => (
    <Card sx={{ mb: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Grid container spacing={3}>
          {Object.entries(data).map(([key, value]) => {
            // Lógica para verificar se deve renderizar
            const shouldRender =
              value !== undefined &&
              value !== null &&
              value !== '' &&
              !(Array.isArray(value) && value.length === 0);

            if (!shouldRender) {
              return null;
            }

            return (
              <Grid item xs={12} sm={6} key={key}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                    {getFieldLabel(key)}
                  </Typography>
                  {Array.isArray(value) && value.length > 0 ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {value.map((item, index) => (
                        <Chip key={index} label={item} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  ) : (
                    <Typography variant="body1">{renderFieldValue(value)}</Typography>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <FormStepper currentStep={4} />

        <Divider sx={{ my: 4 }} />

        {/* Seções organizadas pelos dados do hook */}
        {renderSection(reviewData.basicInfo.title, reviewData.basicInfo.data)}
        {renderSection(reviewData.segmentation.title, reviewData.segmentation.data)}
        {renderSection(reviewData.advancedFilters.title, reviewData.advancedFilters.data)}

        {/* Generated Query Display */}
        {generatedQuery && (
          <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Query da Audiência Gerada
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  fontFamily: 'monospace',
                  backgroundColor: '#f5f5f5',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid #ddd',
                  mb: 2,
                }}
              >
                {typeof generatedQuery === 'string'
                  ? generatedQuery
                  : JSON.stringify(generatedQuery, null, 2)}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(
                    typeof generatedQuery === 'string'
                      ? generatedQuery
                      : JSON.stringify(generatedQuery, null, 2)
                  );
                  toast.success('Query copiada para a área de transferência!');
                }}
                sx={{ mt: 1 }}
              >
                Copiar Query
              </Button>
            </Box>
          </Paper>
        )}

        {/* Generated Briefing Display */}
        {generatedBriefing && (
          <Paper sx={{ p: 4, mb: 4, bgcolor: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Briefing Gerado
            </Typography>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
              }}
            >
              {generatedBriefing}
            </Typography>
          </Paper>
        )}

        {/* Action Buttons */}
        <Stack spacing={3} sx={{ mt: 4 }}>
          {/* Primeira linha de botões - Query e Draft */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              type="button"
              onClick={() => {
                clearAllData();
                handleBackToBasicInfo();
              }}
              disabled={isGeneratingQuery || isGenerating}
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

            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Botão sempre "Gerar Query da Audiência" */}
              <LoadingButton
                variant="contained"
                type="button"
                loading={isGeneratingQuery}
                loadingIndicator={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      Gerando Query...
                    </Typography>
                  </Box>
                }
                onClick={handleGenerateQuery}
                disabled={
                  !reviewData.basicInfo.data.campaignName || isGenerating || !!generatedQuery
                }
                sx={{
                  backgroundColor: '#093366',
                  color: 'white',
                  height: 48,
                  minHeight: 48,
                  '&:hover': {
                    backgroundColor: '#07264d',
                  },
                }}
              >
                Gerar Query da Audiência
              </LoadingButton>

              {generatedQuery && (
                <Button
                  variant="contained"
                  type="button"
                  onClick={handleSaveAsDraft}
                  disabled={isGeneratingQuery || isGenerating}
                  sx={{
                    backgroundColor: '#093366',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#07264d',
                    },
                  }}
                >
                  Salvar como Template
                </Button>
              )}
            </Box>
          </Box>

          {generatedQuery && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <LoadingButton
                variant="contained"
                color="primary"
                type="button"
                size="large"
                loading={isGenerating}
                loadingIndicator={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                    <Typography variant="body2" sx={{ color: 'white' }}>
                      Salvando e gerando briefing...
                    </Typography>
                  </Box>
                }
                sx={{
                  backgroundColor: '#093366',
                  '&:hover': { backgroundColor: '#07264d' },
                  minWidth: 200,
                }}
                onClick={async () => {
                  await handleGenerateBriefing();
                  router.push('/audience');
                }}
                disabled={!generatedQuery}
              >
                Salvar e Avançar
              </LoadingButton>
            </Box>
          )}
        </Stack>
      </Box>
    </Container>
  );
}
