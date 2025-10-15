
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
       
       
        {/* --- Seção 3. Configurações Avançadas (Grupo/Marca mockado, resto dinâmico) --- */}
        {/* <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              3. Configurações Avançadas
            </Typography>
            <Grid container spacing={3}>
              {Object.entries(reviewData.advancedFilters.data).map(([key, value]) => {
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
                      {key === 'nom_grupo_marca' || key === 'brand' || key === 'grupoMarca' ? (
                        <Typography variant="body1">MARCA</Typography>
                      ) : Array.isArray(value) && value.length > 0 ? (
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
        </Card> */}

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
              
             
              {/* --- BLOCO COM MÁSCARA --- */}
               {/* {(() => {
                const rawQuery = typeof generatedQuery === 'string'
                  ? generatedQuery
                  : JSON.stringify(generatedQuery, null, 2);
                const maskedQuery = rawQuery.replace(/(nom_grupo_marca\s*=\s*')([^']*)(')/g, '$1MARCA$3');
                return (
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
                    {maskedQuery}
                  </Typography>
                );
              })()} 
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const rawQuery = typeof generatedQuery === 'string'
                    ? generatedQuery
                    : JSON.stringify(generatedQuery, null, 2);
                  const maskedQuery = rawQuery.replace(/(nom_grupo_marca\s*=\s*')([^']*)(')/g, '$1MARCA$3');
                  navigator.clipboard.writeText(maskedQuery);
                  toast.success('Query copiada para a área de transferência!');
                }}
                sx={{ mt: 1 }}
              >
                Copiar Query
              </Button> */}
              {/* --- FIM BLOCO COM MÁSCARA --- */}
            
          </Paper>
          
        )}


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

        <Stack spacing={3} sx={{ mt: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              type="button"
              onClick={() => {
                clearAllData();
                handleBackToBasicInfo();
              }}
              disabled={isGeneratingQuery || isGenerating || isSaving}
              sx={{
                color: '#093366',
                backgroundColor: 'white',
                borderColor: '#093366',
                '&:hover': {
                  backgroundColor: '#f8f9fa',
                  borderColor: '#093366',
                },
              }}
              fullWidth
            >
              Voltar ao Início
            </Button>
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
              fullWidth
            >
              Gerar Query da Audiência
            </LoadingButton>
            {(generatedQuery || campaignData.generated_query) && (
              <>
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
                    // ...existing code for Salvar e Avançar...
                    console.log('DADOS DO CONTEXTO:', campaignData);
                    const payload = buildArchivePayload({
                      campaignCore: {
                        offer: campaignData.offer || '',
                        code: campaignData.campaign_codes || campaignData.campaignCode || '',
                        campaign_name: campaignData.campaign_name || campaignData.campaignName || '',
                        campaign_type: Array.isArray(campaignData.campaign_type)
                          ? campaignData.campaign_type[0]
                          : campaignData.campaign_type || campaignData.campaignType || '',
                        campaign_objective: Array.isArray(campaignData.campaign_objective)
                          ? campaignData.campaign_objective[0]
                          : campaignData.campaign_objective || campaignData.campaignObjective || '',
                        start_date: campaignData.start_date
                          ? campaignData.start_date.split('T')[0]
                          : campaignData.campaignStartDate
                          ? new Date(campaignData.campaignStartDate).toISOString().split('T')[0]
                          : '',
                        end_date: campaignData.end_date
                          ? campaignData.end_date.split('T')[0]
                          : campaignData.campaignEndDate
                          ? new Date(campaignData.campaignEndDate).toISOString().split('T')[0]
                          : '',
                        segmentation_sql: campaignData.generatedQuery || campaignData.generated_query || '',
                        audience_snapshot: campaignData.audienceInfo?.audienceSize ?? 0,
                        status: 'draft',
                        is_template: false,
                      },
                      // @ts-ignore
                      channels: (campaignData.channel || []).map((type, idx) => ({
                        id: idx + 1,
                        quantity: campaignData[`quantity_${type}`] || 0,
                      })),
                      briefingCore: {
                        name: campaignData.journey_name || campaignData.campaign_name || campaignData.campaignName || 'NOME_PADRAO',
                        segmentation: (campaignData.segmentation || []).join(' AND '),
                        source_base_id: campaignData.source_base_id || '1',
                        source_base: (campaignData.base_origin && campaignData.base_origin[0]) || campaignData.source_base || '',
                      },
                      briefingFields: [
                        { name: 'nom_grupo_marca', value: campaignData.nom_grupo_marca || '' },
                        { name: 'modalidade', value: (campaignData.modalidade || []).join(', ') },
                        { name: 'atl_niveldeensino__c', value: (campaignData.atl_niveldeensino__c || []).join(', ') },
                        { name: 'forma_ingresso_enem', value: campaignData.forma_ingresso_enem ? 'true' : 'false' },
                        { name: 'forma_ingresso_vestibular', value: campaignData.forma_ingresso_vestibular ? 'true' : 'false' },
                        { name: 'disponibilizacao_call_center_nao', value: campaignData.disponibilizacao_call_center_nao ? 'true' : 'false' },
                        { name: 'disponibilizacao_call_center_sim', value: campaignData.disponibilizacao_call_center_sim ? 'true' : 'false' },
                        { name: 'status_funil', value: campaignData.status_funil || '' },
                        { name: 'outras_exclusoes', value: campaignData.outras_exclusoes || '' },
                        { name: 'criterios_saida', value: campaignData.criterios_saida || '' },
                        { name: 'informacoes_extras', value: campaignData.informacoes_extras || '' },
                        { name: 'base_origin', value: (campaignData.base_origin && campaignData.base_origin[0]) || '' },
                      ],
                    });
                    console.log('Payload a ser salvo histoarico:', payload);
                    const response = await saveArchive(payload);
                    if (response?.data?.id) {
                      sessionStorage.setItem('archiveId', response.data.id);
                      sessionStorage.setItem('archivePayload', JSON.stringify(payload));
                    }
                    await handleGenerateBriefing();
                    router.push('/audience');
                  }}
                  disabled={!generatedQuery}
                  fullWidth
                >
                  Salvar e Avançar
                </LoadingButton>
                <Button
                  variant="contained"
                  color="primary"
                  type="button"
                  size="large"
                  disabled={isGenerating || isSaving}
                  onClick={() => handleOpenModal(true)}
                  sx={{
                    backgroundColor: '#093366',
                    '&:hover': { backgroundColor: '#07264d' },
                    minWidth: 200,
                  }}
                  fullWidth
                >
                  Salvar como Template
                </Button>
              </>
            )}
          </Stack>

       
        </Stack>

 <Dialog
          open={openModal}
          onClose={handleCloseModal}
          aria-labelledby="save-dialog-title"
          BackdropProps={{
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
            inert: openModal ? true : undefined,
          }}
        >
          <DialogTitle id="save-dialog-title">
            {isTemplate ? 'Salvar como Template' : 'Salvar Campanha'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Descrição do Template"
              type="text"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="inherit">
              Cancelar
            </Button>
            <Button onClick={handleSave} variant="contained" sx={{ backgroundColor: '#093366' }}>
              Salvar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}