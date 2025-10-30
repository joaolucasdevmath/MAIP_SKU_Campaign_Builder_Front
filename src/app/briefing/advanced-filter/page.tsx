'use client';

import { Box, Grid, Button, MenuItem, Typography } from '@mui/material';

import { useAdvancedFilterForm, getAdvancedFieldComponent } from 'src/hooks/useAdvancedFilterForm';

import { useFormWizard } from 'src/context/FormWizardContext';

import { Field } from 'src/components/hook-form';
import { FormStepper } from 'src/components/form-stepper';
import { SplashScreen } from 'src/components/loading-screen';
import { Form } from 'src/components/hook-form/form-provider';
import { FieldWithLabel } from 'src/components/field-with-label';
import { RHFSelect, RHFMultiSelect } from 'src/components/hook-form/rhf-select';

export default function AdvancedFilterPage() {
  const {
    fields,
    loading,
    error,
    handleSubmit,
    handlePrevious,
    handleSubmitWithValidation,
    formState,
    ...methods
  } = useAdvancedFilterForm({});

  const { state: formWizardState } = useFormWizard();

  // Loading
  if (loading || fields.length === 0) {
    return (
      <Box>
        <FormStepper />
        <Box sx={{ mt: 4, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SplashScreen portal={false} />
        </Box>
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Carregando filtros avançados...
        </Typography>
      </Box>
    );
  }

  // Error
  if (error) {
    return (
      <Box>
        <FormStepper />
        <Box sx={{ mt: 4, minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
          <Typography variant="h6" color="error">{error}</Typography>
          <Button variant="contained" onClick={handlePrevious} sx={{ bgcolor: '#093366', '&:hover': { bgcolor: '#07264d' } }}>
            Voltar
          </Button>
        </Box>
      </Box>
    );
  }

 const renderField = (field: any) => {
  const options = field.values?.map((opt: any) => ({
    label: opt.label || opt.value,
    value: opt.value || opt.id || opt,
  })) || [];

  // RANGE
  if (field.type === 'range') {
    return (
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Field.Text name={`${field.name}.min`} label="Mínimo" type="number" placeholder="Mín." />
        </Grid>
        <Grid item xs={6}>
          <Field.Text name={`${field.name}.max`} label="Máximo" type="number" placeholder="Máx." />
        </Grid>
      </Grid>
    );
  }


if (field.type === 'dropdown' && !field.multiple) {
  return (
    <RHFSelect
      name={field.name}
      placeholder={`Selecione ${field.label.toLowerCase()}...`}
      sx={{ width: '100%' }}
    >
      {options.map((opt: any) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </RHFSelect>
  );
}

  if (field.type === 'dropdown' && field.multiple || field.type === 'checkbox') {
    return (
      <RHFMultiSelect
        name={field.name}
        options={options}
        chip
        checkbox={field.type === 'checkbox'}
        placeholder={`Selecione ${field.label.toLowerCase()}...`}
        sx={{ width: '100%' }}
      />
    );
  }

  // OUTROS: text, number, boolean
  const Component = getAdvancedFieldComponent(field);
  if (!Component) return <Field.Text name={field.name} sx={{ width: '100%' }} />;

  return (
    <Component
      name={field.name}
      type={field.type === 'number' ? 'number' : undefined}
      placeholder={
        field.type === 'text'
          ? `Digite ${field.label.toLowerCase()}...`
          : field.type === 'number'
          ? '0'
          : undefined
      }
      sx={{ width: '100%' }}
    />
  );
};

  return (
    <Box>
      <FormStepper />

      {/* Erros de validação */}
      {Object.keys(formState.errors).length > 0 && (
        <Box
          data-testid="error-container"
          sx={{
            mt: 2,
            p: 2,
            bgcolor: '#ffebee',
            border: '1px solid #f44336',
            borderRadius: 1,
            scrollMarginTop: '20px',
          }}
        >
          <Typography variant="h6" color="error" gutterBottom>
            Corrija os erros:
          </Typography>
          {Object.entries(formState.errors).map(([key, err]: [string, any]) => (
            <Typography key={key} variant="body2" color="error">
              • {err?.message || `Erro em ${key}`}
            </Typography>
          ))}
        </Box>
      )}

      <Box sx={{ mt: 4 }}>
        {/* @ts-ignoree */}
        <Form methods={methods} onSubmit={handleSubmitWithValidation}>
          <Grid container spacing={3}>
            {fields.map((field) => (
              <Grid item xs={12} key={field.name}>
                <FieldWithLabel label={field.label} required={field.required}>
                  {renderField(field)}
                </FieldWithLabel>
              </Grid>
            ))}

            {/* Critérios de Saída */}
            <Grid item xs={12}>
              <FieldWithLabel label="Critérios de Saída">
                <Field.Text
                  name="criterios_saida"
                  multiline
                  rows={4}
                  placeholder="Descreva critérios de saída..."
                  sx={{ width: '100%' }}
                />
              </FieldWithLabel>
            </Grid>

            {/* Botões */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" mt={4}>
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  sx={{
                    color: '#093366',
                    borderColor: '#093366',
                    '&:hover': { bgcolor: '#f8f9fa', borderColor: '#093366' },
                  }}
                >
                  Voltar
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: '#093366', '&:hover': { bgcolor: '#07264d' } }}
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