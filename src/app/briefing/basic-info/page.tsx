'use client';

import { Box, Grid, Button, Typography, CircularProgress } from '@mui/material';

import { useBasicInfoForm } from 'src/hooks/useBasicInfoForm';

import { FormStepper } from 'src/components/form-stepper';
import { Form } from 'src/components/hook-form/form-provider';
import { FieldWithLabel } from 'src/components/field-with-label';
import { RHFCheckbox } from 'src/components/hook-form/rhf-checkbox';
import { RHFMultiSelect } from 'src/components/hook-form/rhf-select';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';
import { RHFDatePicker } from 'src/components/hook-form/rhf-date-picker';



export default function BasicInfoPage() {
  const {
    fields,
    loading,
    control,
    handleSubmit,
    onSubmit,
    handleNext,
    selectedChannels,
    campaignObjectiveField,
    campaignTypeField,
    channelField,
    offerField,
    campaignCodesField,
    ...methods
  } = useBasicInfoForm({});

  if (loading || fields.length === 0) {
    return (
      <Box>
        <FormStepper />
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            gap: 3,
          }}
        >
          <CircularProgress size={50} sx={{ color: '#093366' }} />
          <Typography variant="h6" color="text.secondary">
            Carregando campos do formulário...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aguarde enquanto buscamos as configurações.
          </Typography>
        </Box>
      </Box>
    );
  }


  return (
    <Box>
      <FormStepper />
      <Box sx={{ mt: 4 }}>
        <Form methods={{ control, handleSubmit, ...methods }} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Campo estático: Nome da Campanha */}
            <Grid item xs={12}>
              <FieldWithLabel label="Nome da Campanha" required>
                <RHFTextField
                  name="campaign_name"
                  placeholder="Ex: Campanha Captação Q1 2025"
                  helperText="Nome da campanha para identificação e organização."
                />
              </FieldWithLabel>
            </Grid>

            <Grid item xs={12} md={6}>
              {campaignTypeField && (
                <FieldWithLabel label={campaignTypeField.label}>
                  <RHFMultiSelect
                    name={campaignTypeField.name}
                    placeholder="Selecione o tipo da campanha"
                    options={
                      campaignTypeField.values?.map((item: any) => ({
                        label: item.label || item.value || item,
                        value: item.value || item.id || item,
                      })) || []
                    }
                    chip
                    checkbox
                    helperText="Tipo principal da campanha."
                    variant="outlined"
                  />
                </FieldWithLabel>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              {campaignObjectiveField && (
                <FieldWithLabel label={campaignObjectiveField.label}>
                  <RHFMultiSelect
                    name={campaignObjectiveField.name}
                    placeholder="Selecione o objetivo da campanha"
                    options={
                      campaignObjectiveField.values?.map((item: any) => ({
                        label: item.label || item.value || item,
                        value: item.value || item.id || item,
                      })) || []
                    }
                    chip
                    checkbox
                    helperText="Objetivo específico da campanha."
                    variant="outlined"
                  />
                </FieldWithLabel>
              )}
            </Grid>

            {offerField && (
              <Grid item xs={12} md={6}>
                <FieldWithLabel label={offerField.label}>
                  <RHFTextField
                    name={offerField.name}
                    placeholder="Ex: Desconto 15% na matrícula, Bolsa 30%"
                    helperText="Descreva as ofertas desta campanha para histórico e referência futura."
                    multiline
                    rows={1}
                  />
                </FieldWithLabel>
              </Grid>
            )}

            {campaignCodesField && (
              <Grid item xs={12} md={6}>
                <FieldWithLabel label={`${campaignCodesField.label} (Opcional)`}>
                  <RHFTextField
                    name={campaignCodesField.name}
                    placeholder="Ex: PLANO_ACAO_SEMANAL_07.a.11_ABRIL2025_LEADS_EMKT"
                    helperText="Código interno para identificação e rastreamento da campanha."
                  />
                </FieldWithLabel>
              </Grid>
            )}

            <Grid item xs={12}>
              {channelField && (
                <FieldWithLabel label={channelField.label}>
                  <RHFMultiSelect
                    name={channelField.name}
                    placeholder="Selecione os tipos de disparo"
                    options={
                      channelField.values?.map((item: any) => ({
                        label: item.label || item.value || item,
                        value: item.value || item.id || item,
                      })) || []
                    }
                    chip
                    checkbox
                    helperText="Selecione os tipos de disparo para esta campanha."
                    variant="outlined"
                  />
                </FieldWithLabel>
              )}
            </Grid>

            {selectedChannels.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                    Quantidade de Disparos por Canal
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedChannels.map((channelValue: string) => {
                      const channelOption = channelField?.values?.find(
                        (item: any) => (item.value || item.id || item) === channelValue
                      );
                      const channelLabel =
                        channelOption?.label || channelOption?.value || channelValue;

                      return (
                        <Grid item xs={12} md={6} key={channelValue}>
                          <FieldWithLabel label={channelLabel}>
                            <RHFTextField
                              name={`quantity_${channelValue}`}
                              placeholder="Quantidade"
                              type="number"
                              helperText={`Quantidade de disparos para ${channelLabel}`}
                            />
                          </FieldWithLabel>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <FieldWithLabel label="Data de Início da Campanha">
                <RHFDatePicker name="start_date" />
              </FieldWithLabel>
            </Grid>

            <Grid item xs={12} md={6}>
              <FieldWithLabel label="Data de Fim da Campanha">
                <RHFDatePicker name="end_date" />
              </FieldWithLabel>
            </Grid>

            <Grid item xs={12}>
              <RHFCheckbox
                name="is_continuous"
                label="Campanha Contínua"
                helperText="Marque esta opção para campanhas de relacionamento ou transacionais sem data de fim prevista."
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" mt={3}>
                <Button variant="outlined" color="error" type="button">
                  Limpar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="button"
                  sx={{ backgroundColor: '#093366', '&:hover': { backgroundColor: '#07264d' } }}
                  onClick={handleSubmit(handleNext)}
                >
                  Próximo
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Form>
      </Box>
    </Box>
  );
}
