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
  CircularProgress,
} from '@mui/material';

import { useAdvancedFilterForm } from 'src/hooks/useAdvancedFilterForm';

import { FormStepper } from 'src/components/form-stepper';
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
    handleNext,
    handlePrevious,
    ...methods
  } = useAdvancedFilterForm({});

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
            {error || 'Carregando filtros avançados...'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aguarde enquanto buscamos as opções de filtro baseadas na audiência selecionada.
          </Typography>
        </Box>
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
    // Casos específicos baseados no nome do campo
    if (field.name === 'forma_ingresso' && field.type === 'checkbox') {
      // Forma de Ingresso como checkboxes
      return (
        <FieldWithLabel label="Forma de Ingresso" required={field.required}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {field.values?.map((option: any, optionIndex: number) => (
              <RHFCheckbox
                key={`${option.value}-${optionIndex}`}
                name={`${field.name}_${option.value.toLowerCase().replace(/\s+/g, '_')}`}
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
      );
    }

    switch (field.type) {
      case 'dropdown':
        if (
          field.name === 'nom_curso' ||
          field.name === 'nom_curso_exclude' ||
          field.name === 'atl_niveldeensino__c' ||
          field.name === 'modalidade'
        ) {
          return (
            <Controller
              name={field.name}
              control={control}
              defaultValue={[]}
              render={({ field: fieldProps }) => (
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  options={field.values || []}
                  getOptionLabel={(option) => option.label || option}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                  getOptionKey={(option) => option.value}
                  value={fieldProps.value || []}
                  onChange={(_, newValue) => fieldProps.onChange(newValue)}
                  onInputChange={(_, newInputValue) => {}}
                  filterOptions={(options, { inputValue }) => {
                    if (!inputValue || inputValue.trim() === '') {
                      return options;
                    }

                    const searchTerm = inputValue.toLowerCase().trim();

                    const filtered = options.filter((option) => {
                      const label = (option.label || '').toLowerCase();

                      if (label.startsWith(searchTerm)) {
                        return true;
                      }

                      const words = label.split(/\s+/);
                      return words.some((word: string) => word.startsWith(searchTerm));
                    });

                    return filtered;
                  }}
                  noOptionsText="Nenhum curso encontrado"
                  clearOnEscape
                  openOnFocus
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder={
                        field.placeholder || `Busque e selecione ${field.label.toLowerCase()}`
                      }
                      variant="outlined"
                      helperText={`Busque e selecione múltiplos ${field.label.toLowerCase()}.`}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          variant="outlined"
                          label={option.label}
                          {...tagProps}
                          sx={{
                            borderColor: '#093366',
                            color: '#093366',
                            '& .MuiChip-deleteIcon': {
                              color: '#093366',
                            },
                          }}
                        />
                      );
                    })
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#093366',
                      },
                    },
                  }}
                />
              )}
            />
          );
        }

        return (
          <RHFTextField
            name={field.name}
            select
            placeholder={field.placeholder || `Selecione ${field.label.toLowerCase()}`}
            variant="outlined"
            helperText={`Selecione uma opção para ${field.label.toLowerCase()}.`}
          >
            {field.values?.map((option: any, optionIndex: number) => (
              <MenuItem key={`${option.value}-${optionIndex}`} value={option.value}>
                {option.count ? `${option.label} (${option.count})` : option.label}
              </MenuItem>
            ))}
          </RHFTextField>
        );

      case 'number':
        return (
          <RHFTextField
            name={field.name}
            type="number"
            placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
            variant="outlined"
            inputProps={{
              min: field.min_value || 0,
              max: field.max_value || 999,
            }}
            helperText={
              field.min_value && field.max_value
                ? `Valor entre ${field.min_value} e ${field.max_value}`
                : `Digite um valor para ${field.label.toLowerCase()}.`
            }
          />
        );

      case 'text':
        return (
          <RHFTextField
            name={field.name}
            placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
            variant="outlined"
            multiline={field.name === 'informacoes_extras'}
            rows={field.name === 'informacoes_extras' ? 4 : 1}
            helperText={`Digite ${field.label.toLowerCase()}.`}
          />
        );

      case 'boolean':
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

      case 'range':
        return (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <RHFTextField
                name={`${field.name}.min`}
                type="number"
                label="Mínimo"
                placeholder="Min"
                variant="outlined"
                inputProps={{
                  min: field.min_value || 0,
                  max: field.max_value || 100,
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <RHFTextField
                name={`${field.name}.max`}
                type="number"
                label="Máximo"
                placeholder="Max"
                variant="outlined"
                inputProps={{
                  min: field.min_value || 0,
                  max: field.max_value || 100,
                }}
              />
            </Grid>
          </Grid>
        );

      default:
        return (
          <RHFTextField
            name={field.name}
            placeholder={field.placeholder || `Digite ${field.label.toLowerCase()}`}
            variant="outlined"
            helperText={`Digite ${field.label.toLowerCase()}.`}
          />
        );
    }
  };

  return (
    <Box>
      <FormStepper />
      
      {/* Exibição de Erros de Validação */}
      {Object.keys(methods.formState.errors).length > 0 && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#ffebee', borderRadius: 1, border: '1px solid #f44336' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Por favor, corrija os seguintes erros:
          </Typography>
          {Object.entries(methods.formState.errors).map(([key, fieldError]) => (
            <Typography key={key} variant="body2" color="error" sx={{ mb: 1 }}>
              • {typeof fieldError?.message === 'string'
                  ? fieldError.message
                  : `Erro no campo ${key}`}
            </Typography>
          ))}
        </Box>
      )}
      
      <Box sx={{ mt: 4 }}>
        <Form methods={{ control, handleSubmit, ...methods }} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {fields.map((field, fieldIndex) => (
              <Grid item xs={12} key={`${field.name}-${fieldIndex}`}>
                {field.name === 'forma_ingresso' && field.type === 'checkbox' ? (
                  renderField(field)
                ) : field.type === 'boolean' || field.type === 'checkbox' ? (
                  renderField(field)
                ) : (
                  <FieldWithLabel label={field.label} required={field.required}>
                    {renderField(field)}
                  </FieldWithLabel>
                )}
              </Grid>
            ))}

            {/* Campos Estáticos Adicionais */}
            <Grid item xs={12}>
              <FieldWithLabel label="Outras Exclusões">
                <RHFTextField
                  name="outras_exclusoes"
                  placeholder="Descreva outras exclusões específicas para esta campanha..."
                  variant="outlined"
                  multiline
                  rows={4}
                  helperText="Descreva exclusões adicionais que não se encaixam nos filtros acima."
                />
              </FieldWithLabel>
            </Grid>

            <Grid item xs={12}>
              <FieldWithLabel label="Critérios de Saída">
                <RHFTextField
                  name="criterios_saida"
                  placeholder="Descreva quando um contato deve ser removido automaticamente da campanha..."
                  variant="outlined"
                  multiline
                  rows={4}
                  helperText="Defina quando os contatos devem ser removidos automaticamente da campanha."
                />
              </FieldWithLabel>
            </Grid>

            <Grid item xs={12}>
              <FieldWithLabel label="Disponibilização para Call Center?">
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
              <FieldWithLabel label="Informações Extras">
                <RHFTextField
                  name="informacoes_extras"
                  placeholder="Descreva qualquer informação adicional que não se encaixa nos campos acima..."
                  variant="outlined"
                  multiline
                  rows={4}
                  helperText="Campo livre para informações que fazem ao formulário padrão e que não precisam solicitar."
                />
              </FieldWithLabel>
            </Grid>

            {/* Botões de Navegação */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" mt={4}>
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
                  onClick={handleSubmit((formValues) => {
                    console.log('✅ Validação passou! Dados do formulário:', formValues);

                    // Transforma os dados para o formato esperado
                    const transformedData = {
                      ...formValues,
                      atl_niveldeensino__c: Array.isArray(formValues.atl_niveldeensino__c)
                        ? formValues.atl_niveldeensino__c.map((item: any) => item.value || item)
                        : formValues.atl_niveldeensino__c,
                      modalidade: Array.isArray(formValues.modalidade)
                        ? formValues.modalidade.map((item: any) => item.value || item)
                        : formValues.modalidade,
                      nom_curso: Array.isArray(formValues.nom_curso)
                        ? formValues.nom_curso.map((item: any) => item.value || item)
                        : formValues.nom_curso,
                      nom_curso_exclude: Array.isArray(formValues.nom_curso_exclude)
                        ? formValues.nom_curso_exclude.map((item: any) => item.value || item)
                        : formValues.nom_curso_exclude,
                    };

                    handleNext(transformedData);
                  }, (errors) => {
                    console.log('❌ Erros de validação:', errors);
                  })}
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
