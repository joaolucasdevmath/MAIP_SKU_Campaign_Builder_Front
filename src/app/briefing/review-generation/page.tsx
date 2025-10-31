// src/app/briefing/review-generation/page.tsx

'use client';

import React, { useState } from 'react';
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
  Dialog,
  Divider,
  Container,
  TextField,
  Typography,
  CardContent,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { useArchive } from 'src/hooks/useArchive';
import { useTemplate } from 'src/hooks/useTemplate';
import { useAudienceQuery } from 'src/hooks/useAudienceQuery';
import { useBriefingReview } from 'src/hooks/useBriefingReview';

import { useFormWizard } from 'src/context/FormWizardContext';

import { toast } from 'src/components/snackbar';
import { FormStepper } from 'src/components/form-stepper/FormStepper';

export default function ReviewGeneration() {
  const { state: campaignData } = useFormWizard();
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
  const { saveArchive, buildArchivePayload } = useArchive();
  const {
    isGenerating: isGeneratingQuery,
    generatedQuery,
    handleGenerateQuery,
    clearAllData,
  } = useAudienceQuery();
  const { isSaving, saveTemplate } = useTemplate();

  const [openModal, setOpenModal] = useState(false);
  const [description, setDescription] = useState('');
  const [isTemplate, setIsTemplate] = useState(false);

  const handleOpenModal = (isTemplateMode: boolean) => {
    setIsTemplate(isTemplateMode);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setDescription('');
  };

  const handleSave = async () => {
    try {
      await saveTemplate(isTemplate, description);
      if (!isTemplate) {
        await handleGenerateBriefing();
        router.push('/audience');
      }
      handleCloseModal();
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };

  // FUNÇÃO CORRETA (RESTAURADA)
  const renderSection = (title: string, data: Record<string, any>) => (
    <Card sx={{ mb: 3, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Grid container spacing={3}>
          {Object.entries(data).map(([key, value]) => {
            const shouldRender =
              value !== undefined &&
              value !== null &&
              value !== '' &&
              !(Array.isArray(value) && value.length === 0);

            if (!shouldRender) return null;

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

        {renderSection(reviewData.basicInfo.title, reviewData.basicInfo.data)}
        {renderSection(reviewData.segmentation.title, reviewData.segmentation.data)}
        {renderSection(reviewData.advancedFilters.title, reviewData.advancedFilters.data)}

        {/* Generated Query */}
        {generatedQuery && (
          <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Query da Audiência Gerada</Typography>
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
                {typeof generatedQuery === 'string' ? generatedQuery : JSON.stringify(generatedQuery, null, 2)}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  navigator.clipboard.writeText(
                    typeof generatedQuery === 'string' ? generatedQuery : JSON.stringify(generatedQuery, null, 2)
                  );
                  toast.success('Query copiada!');
                }}
                sx={{ mt: 1 }}
              >
                Copiar Query
              </Button>
            </Box>
          </Paper>
        )}

        {generatedBriefing && (
          <Paper sx={{ p: 4, mb: 4, bgcolor: '#f8f9fa', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Briefing Gerado</Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {generatedBriefing}
            </Typography>
          </Paper>
        )}

        <Stack spacing={3} sx={{ mt: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="outlined"
              onClick={() => {
                clearAllData();
                handleBackToBasicInfo();
              }}
              disabled={isGeneratingQuery || isGenerating || isSaving}
              sx={{ color: '#093366', borderColor: '#093366', '&:hover': { bgcolor: '#f8f9fa' } }}
              fullWidth
            >
              Voltar ao Início
            </Button>

            <LoadingButton
              variant="contained"
              loading={isGeneratingQuery}
              onClick={handleGenerateQuery}
              disabled={!reviewData.basicInfo.data.campaignName || isGenerating || !!generatedQuery}
              sx={{ bgcolor: '#093366', '&:hover': { bgcolor: '#07264d' } }}
              fullWidth
            >
              Gerar Query da Audiência
            </LoadingButton>

            {(generatedQuery || campaignData.generated_query) && (
              <>
                <LoadingButton
                  variant="contained"
                  loading={isGenerating}
                  onClick={async () => {
                    const payload = buildArchivePayload({
                      campaignCore: {
                        offer: campaignData.offer || '',
                        code: campaignData.code || '',
                        campaign_name: campaignData.campaign_name || '',
                        campaign_type: Array.isArray(campaignData.campaign_type)
                          ? campaignData.campaign_type[0]
                          : campaignData.campaign_type || '',
                        campaign_objective: Array.isArray(campaignData.campaign_objective)
                          ? campaignData.campaign_objective[0]
                          : campaignData.campaign_objective || '',
                        start_date: campaignData.start_date || '',
                        end_date: campaignData.end_date || '',
                        segmentation_sql: campaignData.generated_query || '',
                        audience_snapshot: campaignData.audience_volume || 0,
                        status: 'draft',
                        is_template: false,
                      },
                      channels: (campaignData.channel || []).map((type: string, idx: number) => ({
                        id: idx + 1,
                        quantity: campaignData[`quantity_${type.toUpperCase()}`] || 0,
                      })),
                      briefingCore: {
                        name: campaignData.campaign_name || 'NOME_PADRAO',
                        segmentation: (campaignData.segmentation || []).join(' AND '),
                        source_base_id: campaignData.source_base_id || '',
                        source_base: campaignData.base_origin?.[0] || '',
                      },
                      briefingFields: campaignData.briefing?.fields || [],
                    });

                    const response = await saveArchive(payload);
                    if (response?.data?.id) {
                      sessionStorage.setItem('archiveId', response.data.id);
                      sessionStorage.setItem('archivePayload', JSON.stringify(payload));
                    }
                    await handleGenerateBriefing();
                    router.push('/audience');
                  }}
                  disabled={!generatedQuery}
                  sx={{ bgcolor: '#093366', '&:hover': { bgcolor: '#07264d' } }}
                  fullWidth
                >
                  Salvar e Avançar
                </LoadingButton>

                <Button
                  variant="contained"
                  onClick={() => handleOpenModal(true)}
                  disabled={isGenerating || isSaving}
                  sx={{ bgcolor: '#093366', '&:hover': { bgcolor: '#07264d' } }}
                  fullWidth
                >
                  Salvar como Template
                </Button>
              </>
            )}
          </Stack>
        </Stack>

        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>{isTemplate ? 'Salvar como Template' : 'Salvar Campanha'}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              label="Descrição"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancelar</Button>
            <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#093366' }}>
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}