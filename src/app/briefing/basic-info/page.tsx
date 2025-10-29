
'use client';

import dayjs from 'dayjs';
import { useRef, useState, useEffect } from 'react';

import MenuItem from '@mui/material/MenuItem';
import { Box, Grid, Button, Typography } from '@mui/material';

import { useAudienceQuery } from 'src/hooks/useAudienceQuery';
import { useBasicInfoForm } from 'src/hooks/useBasicInfoForm';

import { Field } from 'src/components/hook-form';
import { FormStepper } from 'src/components/form-stepper';
import { SplashScreen } from 'src/components/loading-screen';
import { Form } from 'src/components/hook-form/form-provider';
import { FieldWithLabel } from 'src/components/field-with-label';

/* ---------- UTILIDADES ---------- */
const parseDate = (dateStr: string | undefined): string | null => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('/').map(Number);
  const d = new Date(year, month - 1, day);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().replace('Z', '-03:00');
};

const extractFormValues = (data: any, channelOptions: any[]) => {
  if (!data) return {};
  const core = data.campaign?.core || {};
  return {
    campaign_name: core.campaign_name || '',
    campaign_objective: core.campaign_objective ? [core.campaign_objective] : [],
    campaign_type: core.campaign_type ? [core.campaign_type] : [],
    offer: core.offer || '',
    campaign_codes: core.code || '',
    start_date: parseDate(core.start_date) || null,
    end_date: parseDate(core.end_date) || null,
    is_continuous: core.is_template === false,
  };
};

/* ---------- COMPONENTE ---------- */
export default function BasicInfoPage() {
  const { clearAllData } = useAudienceQuery();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [templateData, setTemplateData] = useState<any | null>(null);
  const hasInitialized = useRef(false);

  /* ---- Hook do formulário ---- */
  const formMethods = useBasicInfoForm({});
  const {
    fields,
    loading,
    handleSubmit,
    onSubmit,
    handleNext,
    selectedChannels,
    channelField,
    reset,
    getFieldComponent,
  } = formMethods;

  const fixedFieldNames = [
    'campaign_name',
    'start_date',
    'end_date',
    'disponibilizacao_call_center_sim',
    'disponibilizacao_call_center_nao',
  ];
  const dynamicFields = fields.filter((f: any) => !fixedFieldNames.includes(f.name));

  
  useEffect(() => {
    clearAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- Preenche com template (uma única vez) ---- */
  useEffect(() => {
    if (templateData && channelField && !hasInitialized.current) {
      const vals = extractFormValues(templateData, channelField.values || []);
      reset(vals);
      sessionStorage.removeItem('briefing_template_data');
      hasInitialized.current = true;
    }
  }, [templateData, channelField, reset]);

  /* ---- Loading ---- */
  if (loading || fields.length === 0) {
    return (
      <Box>
        <FormStepper />
        <Box sx={{ mt: 4, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SplashScreen portal={false} />
        </Box>
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 2 }}>
          Carregando campos...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <FormStepper />
      <Box sx={{ mt: 4 }}>
        <Form
          methods={formMethods}
          onSubmit={handleSubmit((data) => {
           
            if (typeof data.campaign_objective === 'string') {
              data.campaign_objective = data.campaign_objective
                .split(/\r?\n/)
                .map((s: string) => s.trim())
                .filter(Boolean);
            }
            onSubmit(data);
          })}
        >
          <Grid container spacing={3}>
           
            <Grid item xs={12}>
              <FieldWithLabel label="Nome da Campanha" required>
                <Field.Text
                  name="campaign_name"
                  placeholder="Ex: Campanha Captação Q1 2025"
                  helperText="Nome da campanha para identificação e organização."
                />
              </FieldWithLabel>
            </Grid>

            {/* ---- CAMPOS DINÂMICOS  ---- */}
            {/* Área e Subárea em coluna */}
            {dynamicFields.filter(f => f.name === 'area' || f.name === 'subarea').map((field: any) => {
              const Component = getFieldComponent(field);
              if (!Component) return null;
              const options = field.values?.map((it: any) => ({ label: it.label || it.value || it, value: it.value || it.id || it })) || [];
              let children;
              if (field.type === 'dropdown' && !field.multiple) {
                children = options.map((opt: { label: string; value: string }) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ));
              }
              return (
                <Grid item xs={12} key={field.name}>
                  <FieldWithLabel label={field.label} required={field.required}>
                    <Component name={field.name} options={options} placeholder={field.placeholder || `Digite ou selecione ${field.label.toLowerCase()}`} {...(children ? { children } : {})} />
                  </FieldWithLabel>
                </Grid>
              );
            })}

            
            <Grid container item xs={12} spacing={2}>
              {dynamicFields.filter(f => f.name === 'campaign_type' || f.name === 'journey_type').map((field: any) => {
                const Component = getFieldComponent(field);
                if (!Component) return null;
                const options = field.values?.map((it: any) => ({ label: it.label || it.value || it, value: it.value || it.id || it })) || [];
                const isMultiCheckbox = field.type === 'checkbox' && Array.isArray(field.values) && field.values.length > 1;
                if (isMultiCheckbox) {
                  return (
                    <Grid item xs={12} md={6} key={field.name}>
                      <FieldWithLabel label={field.label} required={field.required}>
                        <Field.MultiCheckbox name={field.name} options={options} />
                      </FieldWithLabel>
                    </Grid>
                  );
                }
                return (
                  <Grid item xs={12} md={6} key={field.name}>
                    <FieldWithLabel label={field.label} required={field.required}>
                      <Component name={field.name} options={options} />
                    </FieldWithLabel>
                  </Grid>
                );
              })}
            </Grid>

            
            {dynamicFields.filter(f => f.name === 'channel').map((field: any) => {
              const options = field.values?.map((it: any) => ({ label: it.label || it.value || it, value: it.value || it.id || it })) || [];
              return (
                <>
                  <Grid item xs={12} key={field.name}>
                    <FieldWithLabel label={field.label} required={field.required}>
                      <Field.MultiSelect
                        name={field.name}
                        options={options}
                        chip
                        // @ts-ignore
                        freeSolo
                        placeholder={field.placeholder || 'Digite ou selecione o canal'}
                        helperText="Selecione ou digite os canais de disparo."
                      />
                    </FieldWithLabel>
                  </Grid>
                  {selectedChannels.length > 0 && (
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                          Quantidade de Disparos por Canal
                        </Typography>
                        <Grid container spacing={2}>
                          {selectedChannels.map((channelValue: string) => {
                            const ch = field.values?.find(
                              (it: any) => (it.value || it.id) === channelValue
                            );
                            const label = ch?.label || channelValue;
                            return (
                              <Grid item xs={12} md={6} key={channelValue}>
                                <FieldWithLabel label={label}>
                                  <Field.Text
                                    name={`quantity_${channelValue}`}
                                    type="number"
                                    inputProps={{ min: 0 }}
                                    placeholder="Quantidade"
                                  />
                                </FieldWithLabel>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    </Grid>
                  )}
                </>
              );
            })}

            {/* Demais campos dinâmicos */}
            {dynamicFields.filter(f => !['area', 'subarea', 'campaign_type', 'journey_type', 'channel'].includes(f.name)).map((field: any) => {
              const Component = getFieldComponent(field);
              if (!Component) return null;
              const options = field.values?.map((it: any) => ({ label: it.label || it.value || it, value: it.value || it.id || it })) || [];
              let children;
              if (field.type === 'dropdown' && !field.multiple) {
                children = options.map((opt: { label: string; value: string }) => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ));
              }
              const isMultiCheckbox = field.type === 'checkbox' && Array.isArray(field.values) && field.values.length > 1;
              if (isMultiCheckbox) {
                return (
                  <Grid item xs={12} md={6} key={field.name}>
                    <FieldWithLabel label={field.label} required={field.required}>
                      <Field.MultiCheckbox name={field.name} options={options} />
                    </FieldWithLabel>
                  </Grid>
                );
              }
              return (
                <Grid item xs={12} md={6} key={field.name}>
                  <FieldWithLabel label={field.label} required={field.required}>
                    <Component name={field.name} options={options} {...(children ? { children } : {})} />
                  </FieldWithLabel>
                </Grid>
              );
            })}

            
            <Grid item xs={12} md={6}>
              <FieldWithLabel label="Data de Início da Campanha">
                <Field.DatePicker name="start_date" minDate={dayjs()} />
              </FieldWithLabel>
            </Grid>

            <Grid item xs={12} md={6}>
              <FieldWithLabel label="Data de Fim da Campanha">
                <Field.DatePicker name="end_date" minDate={dayjs()} />
              </FieldWithLabel>
            </Grid>

            {/* ---- Call Center ---- */}
            <Grid item xs={12}>
              <FieldWithLabel label="Disponibilização para Call Center?">
                <Box>
                  <Field.Checkbox
                    name="disponibilizacao_call_center_sim"
                    label="Sim"
                    sx={{ '& .MuiCheckbox-root': { color: '#093366', '&.Mui-checked': { color: '#093366' } } }}
                  />
                  <Field.Checkbox
                    name="disponibilizacao_call_center_nao"
                    label="Não"
                    sx={{ '& .MuiCheckbox-root': { color: '#093366', '&.Mui-checked': { color: '#093366' } } }}
                  />
                </Box>
              </FieldWithLabel>
            </Grid>

            

            {/* ---- Botão Próximo ---- */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" mt={3}>
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