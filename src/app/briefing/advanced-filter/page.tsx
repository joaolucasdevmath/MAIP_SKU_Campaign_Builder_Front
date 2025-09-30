'use client';

import { Controller } from 'react-hook-form';

import {
  Box,
  Chip,
  Grid,
  Button,
  MenuItem,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';

import { useAdvancedFilterForm } from 'src/hooks/useAdvancedFilterForm';
import { useFormWizard } from 'src/context/FormWizardContext';

import { FormStepper } from 'src/components/form-stepper';
import { SplashScreen } from 'src/components/loading-screen';
import { Form } from 'src/components/hook-form/form-provider';
import { FieldWithLabel } from 'src/components/field-with-label';
import { RHFCheckbox } from 'src/components/hook-form/rhf-checkbox';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

export default function AdvancedFilterPage() {
  const {
    fields,
    loading,
    error,
    control,
    handleSubmit,
    onSubmit,
    handlePrevious,
    handleSubmitWithValidation,
    ...methods
  } = useAdvancedFilterForm({});
  const { state: formWizardState } = useFormWizard();

  if (loading || fields.length === 0) {
    return (
      <Box>
        <FormStepper />
        <Box sx={{ mt: 4, minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

  if (error) {
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
          <Typography variant="h6" color="error">
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={handlePrevious}
            sx={{ backgroundColor: '#093366', '&:hover': { backgroundColor: '#07264d' } }}
          >
            Voltar para Step Anterior
          </Button>
        </Box>
      </Box>
    );
  }

  const renderField = (field: any) => {
    if (field.type === 'dropdown') {
      const options = Array.isArray(field.values)
        ? field.values.map((opt: any) => ({ value: opt.value, label: opt.label || opt.value }))
        : [];
      if (field.multiple) {
        return (
          <Controller
            name={field.name}
            control={control}
            defaultValue={[]}
            render={({ field: fieldProps }) => (
              <Autocomplete
                multiple
                disableCloseOnSelect
                options={options}
                getOptionLabel={(option) => option.label || option.toString()}
                isOptionEqualToValue={(option, value) => option.value === value.value || option === value}
                value={fieldProps.value || []}
                onChange={(_, newValue) => fieldProps.onChange(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={field.label}
                    placeholder={`Selecione ${field.label.toLowerCase()}`}
                    variant="outlined"
                    error={!!methods.formState.errors[field.name]}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                     
                      label={option.label || option.toString()}
                      {...getTagProps({ index })}
                      sx={{ bgcolor: '#f1f1f1', color: '#093366' }} 
                    />
                  ))
                }
                PaperComponent={(props) => (
                  <Box
                    {...props}
                    sx={{
                      bgcolor: '#f8f9fa', 
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      borderRadius: 1,
                    }}
                  />
                )}
              />
            )}
          />
        );
      }
      return (
        <RHFTextField
          name={field.name}
          select
          label={field.label}
          variant="outlined"
          error={!!methods.formState.errors[field.name]}
        >
          {options.map((option: any) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </RHFTextField>
      );
    }

    if (field.type === 'boolean') {
      return (
        <RHFCheckbox
          name={field.name}
          label={field.label}
          sx={{
            '& .MuiCheckbox-root': {
              color: '#093366',
              '&.Mui-checked': {
                color: '#093366',
              },
            },
          }}
        />
      );
    }

    if (field.type === 'number') {
      return (
        <RHFTextField
          name={field.name}
          type="number"
          label={field.label}
          variant="outlined"
          error={!!methods.formState.errors[field.name]}
        />
      );
    }

    if (field.type === 'range') {
      return (
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <RHFTextField
              name={`${field.name}.min`}
              type="number"
              label="Mínimo"
              variant="outlined"
              error={!!methods.formState.errors[`${field.name}.min`]}
            />
          </Grid>
          <Grid item xs={6}>
            <RHFTextField
              name={`${field.name}.max`}
              type="number"
              label="Máximo"
              variant="outlined"
              error={!!methods.formState.errors[`${field.name}.max`]}
            />
          </Grid>
        </Grid>
      );
    }

    // Default para text ou outros
    return (
      <RHFTextField
        name={field.name}
        label={field.label}
        variant="outlined"
        multiline={field.name === 'informacoes_extras' || field.name === 'outras_exclusoes'}
        rows={4}
        error={!!methods.formState.errors[field.name]}
      />
    );
  };

  const renderFormaIngressoSection = () => {
    const formaIngressoFields = fields.filter((field) =>
      field.name.startsWith('forma_ingresso_') ||
      field.name === 'tipo_captacao_transf._externa' ||
      field.name === 'tipo_captacao_vestibular_(ingresso_simplificado)'
    );
    if (formaIngressoFields.length > 0) {
      return (
        <Grid item xs={12}>
          <FieldWithLabel
            label="Forma de Ingresso"
            
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
              {formaIngressoFields.map((field, index) => (
                <RHFCheckbox
                  key={index}
                  name={field.name}
                  label={field.label}
                  sx={{
                    '& .MuiCheckbox-root': {
                      color: '#093366',
                      '&.Mui-checked': {
                        color: '#093366',
                      },
                    },
                  }}
                />
              ))}
            </Box>
          </FieldWithLabel>
        </Grid>
      );
    }
    return null;
  };

  const renderStatusVestibularSection = () => {
    const statusVestibularFields = fields.filter((field) => field.name.startsWith('status_prova_'));
    if (statusVestibularFields.length > 0) {
      return (
        <Grid item xs={12}>
          <FieldWithLabel
            label="Status do Vestibular"
           
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
              {statusVestibularFields.map((field, index) => (
                <RHFCheckbox
                  key={index}
                  name={field.name}
                  label={field.label}
                  sx={{
                    '& .MuiCheckbox-root': {
                      color: '#093366',
                      '&.Mui-checked': {
                        color: '#093366',
                      },
                    },
                  }}
                />
              ))}
            </Box>
          </FieldWithLabel>
        </Grid>
      );
    }
    return null;
  };

  const renderNivelEnsinoSection = () => {
    const nivelEnsinoField = fields.find((field) => field.name === 'nom_tipo_curso');
    if (nivelEnsinoField && nivelEnsinoField.type === 'checkbox' && Array.isArray(nivelEnsinoField.values)) {
      return (
        <Grid item xs={12}>
          <FieldWithLabel
            label="Nível de Ensino"
            
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
              {nivelEnsinoField.values.map((option, index) => (
                <RHFCheckbox
                  key={index}
                  name={`nom_tipo_curso[${index}]`}
                  label={option.label}
                  sx={{
                    '& .MuiCheckbox-root': {
                      color: '#093366',
                      '&.Mui-checked': {
                        color: '#093366',
                      },
                    },
                  }}
                />
              ))}
            </Box>
          </FieldWithLabel>
        </Grid>
      );
    }
    return null;
  };

  return (
    <Box>
      <FormStepper />

      {Object.keys(methods.formState.errors).length > 0 && (
        <Box
          data-testid="error-container"
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: '#ffebee',
            borderRadius: 1,
            border: '1px solid #f44336',
            scrollMarginTop: '20px',
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Por favor, corrija os seguintes erros:
          </Typography>
          {Object.entries(methods.formState.errors).map(([key, fieldError]) => (
            <Typography key={key} variant="body2" color="error" sx={{ mb: 1 }}>
              •{' '}
              {typeof fieldError?.message === 'string'
                ? fieldError.message
                : `Erro no campo ${key}`}
            </Typography>
          ))}
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        <Form methods={{ control, handleSubmit, ...methods }} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {fields
              .filter((field) =>
                !field.name.startsWith('forma_ingresso_') &&
                !field.name.startsWith('status_prova_') &&
                !field.name.startsWith('nom_tipo_curso_') &&
                field.name !== 'tipo_captacao_transf._externa' &&
                field.name !== 'tipo_captacao_vestibular_(ingresso_simplificado)'
              )
              .map((field, index) => (
                <Grid item xs={12} key={index}>
                  <FieldWithLabel
                    label={field.label}
                    required={field.required}
                   
                  >
                    {renderField(field)}
                  </FieldWithLabel>
                </Grid>
              ))}
            {renderNivelEnsinoSection()}
            {renderFormaIngressoSection()}
            {renderStatusVestibularSection()}

            <Grid item xs={12}>
              <FieldWithLabel
                label="Outras Exclusões"
               
              >
                <RHFTextField
                  name="outras_exclusoes"
                  placeholder="Descreva outras exclusões..."
                  variant="outlined"
                  multiline
                  rows={4}
                  error={!!methods.formState.errors.outras_exclusoes}
                  helperText={methods.formState.errors.outras_exclusoes?.message}
                />
              </FieldWithLabel>
            </Grid>

            <Grid item xs={12}>
              <FieldWithLabel
                label="Critérios de Saída"
                
              >
                <RHFTextField
                  name="criterios_saida"
                  placeholder="Descreva critérios de saída..."
                  variant="outlined"
                  multiline
                  rows={4}
                  error={!!methods.formState.errors.criterios_saida}
                  helperText={methods.formState.errors.criterios_saida?.message}
                />
              </FieldWithLabel>
            </Grid>

            <Grid item xs={12}>
              <FieldWithLabel
                label="Disponibilização para Call Center?"
                
              >
                <Box>
                  <RHFCheckbox
                    name="disponibilizacao_call_center_sim"
                    label="Sim"
                    sx={{
                      '& .MuiCheckbox-root': {
                        color: '#093366',
                        '&.Mui-checked': {
                          color: '#093366',
                        },
                      },
                    }}
                  />
                  <RHFCheckbox
                    name="disponibilizacao_call_center_nao"
                    label="Não"
                    sx={{
                      '& .MuiCheckbox-root': {
                        color: '#093366',
                        '&.Mui-checked': {
                          color: '#093366',
                        },
                      },
                    }}
                  />
                </Box>
              </FieldWithLabel>
            </Grid>

            <Grid item xs={12}>
              <FieldWithLabel
                label="Informações Extras"
               
              >
                <RHFTextField
                  name="informacoes_extras"
                  placeholder="Informações adicionais..."
                  variant="outlined"
                  multiline
                  rows={4}
                  error={!!methods.formState.errors.informacoes_extras}
                  helperText={methods.formState.errors.informacoes_extras?.message}
                />
              </FieldWithLabel>
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" mt={4}>
                <Button
                  variant="outlined"
                  sx={{
                    color: '#093366',
                    backgroundColor: 'white',
                    borderColor: '#093366',
                    '&:hover': {
                      backgroundColor: '#f8f9fa',
                      borderColor: '#093366',
                    },
                  }}
                  onClick={handlePrevious}
                >
                  Voltar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ backgroundColor: '#093366', '&:hover': { backgroundColor: '#07264d' } }}
                  onClick={handleSubmitWithValidation}
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