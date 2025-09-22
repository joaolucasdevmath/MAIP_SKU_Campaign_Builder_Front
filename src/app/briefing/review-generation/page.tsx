'use client';

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

import { useBriefingReview } from 'src/hooks/useBriefingReview';

import { FormStepper } from 'src/components/form-stepper/FormStepper';

export default function ReviewGeneration() {
  const {
    isGenerating,
    generatedBriefing,
    reviewData,
    handleGenerateBriefing,
    handleBackToBasicInfo,
    renderFieldValue,
    getFieldLabel,
  } = useBriefingReview();

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            type="button"
            onClick={handleBackToBasicInfo}
            disabled={isGenerating}
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
            color="primary"
            type="button"
            size="large"
            loading={isGenerating}
            loadingIndicator={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} sx={{ color: 'white' }} />
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Gerando Briefing...
                </Typography>
              </Box>
            }
            sx={{ backgroundColor: '#093366', '&:hover': { backgroundColor: '#07264d' } }}
            onClick={handleGenerateBriefing}
            disabled={!reviewData.basicInfo.data.campaignName}
          >
            Gerar Briefing
          </LoadingButton>
        </Box>
      </Box>
    </Container>
  );
}
