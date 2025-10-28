'use client';

import { Box, Grid, Button, MenuItem, Typography, CircularProgress } from '@mui/material';

import { useAudienceDefinitionForm } from 'src/hooks/useAudienceDefinitionForm';

import { FormStepper } from 'src/components/form-stepper';
import { SplashScreen } from 'src/components/loading-screen';
import { Form } from 'src/components/hook-form/form-provider';
import { FieldWithLabel } from 'src/components/field-with-label';
import { RHFSelect, RHFMultiSelect } from 'src/components/hook-form/rhf-select';

export default function AudienceDefinitionPage() {
  const {
    fields,
    segmentationOptions,
    loading,
    loadingSegmentation,
    control,
    handleSubmit,
    onSubmit,
    handleNext,
    handlePrevious,
    selectedSourceBase,
    sourceBaseField,
    ...methods
  } = useAudienceDefinitionForm({});

  if (loading || fields.length === 0) {
    return (
      <Box>
        <Box
          sx={{
            mt: 4,
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SplashScreen portal={false} />
        </Box>
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Carregando campos do formulário...
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Aguarde enquanto buscamos as configurações.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <FormStepper />
      <Box sx={{ mt: 4 }}>
        <Form methods={{ control, handleSubmit, ...methods }} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Campo Base de Origem */}
            <Grid item xs={12}>
              {sourceBaseField && (
                <FieldWithLabel label={sourceBaseField.label} required={sourceBaseField.required}>
                  <RHFSelect
                    name={sourceBaseField.name}
                    placeholder="Selecione a base de origem"
                    helperText="Selecione a base de origem da campanha."
                  >
                    {sourceBaseField.values?.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                </FieldWithLabel>
              )}
            </Grid>

            {selectedSourceBase && (
              <Grid item xs={12}>
                <FieldWithLabel label="Segmentação">
                  {loadingSegmentation ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                      <CircularProgress size={20} />
                      <Typography variant="body2">Carregando segmentações...</Typography>
                    </Box>
                  ) : segmentationOptions.length > 0 ? (
                    <RHFMultiSelect
                      name="segmentation"
                      placeholder="Selecione a segmentação"
                      options={segmentationOptions.map((item) => ({
                        label: item.label,
                        value: item.value,
                      }))}
                      chip
                      helperText="Selecione os segmentos para esta campanha."
                      variant="outlined"
                      slotProps={{
                        select: {
                          MenuProps: {
                            PaperProps: {
                              sx: {
                                bgcolor: 'white',
                                '& .MuiMenuItem-root': {
                                  '&:hover': {
                                    bgcolor: '#f0f8ff',
                                  },
                                  '&.Mui-selected': {
                                    bgcolor: '#f0f8ff',
                                    '&:hover': {
                                      bgcolor: '#e6f3ff',
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      }}
                    />
                  ) : (
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Nenhuma segmentação disponível para a base selecionada.
                      </Typography>
                    </Box>
                  )}
                </FieldWithLabel>
              </Grid>
            )}

            {/* Botões de Navegação */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" mt={3}>
                <Button
                  variant="outlined"
                  type="button"
                  onClick={handlePrevious}
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
                  Voltar
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
