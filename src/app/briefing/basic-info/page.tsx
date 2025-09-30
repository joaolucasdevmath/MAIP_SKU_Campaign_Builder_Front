'use client';

import { useEffect, useState } from 'react';
import { Box, Grid, Button, Typography } from '@mui/material';
import { useBasicInfoForm } from 'src/hooks/useBasicInfoForm';
import { toast } from 'src/components/snackbar';
import { FormStepper } from 'src/components/form-stepper';
import { SplashScreen } from 'src/components/loading-screen';
import { Form } from 'src/components/hook-form/form-provider';
import { FieldWithLabel } from 'src/components/field-with-label';
import { RHFCheckbox } from 'src/components/hook-form/rhf-checkbox';
import { RHFMultiSelect } from 'src/components/hook-form/rhf-select';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';
import { RHFDatePicker } from 'src/components/hook-form/rhf-date-picker';

// Função para converter data do formato DD/MM/YYYY para string ISO com fuso -03:00
const parseDate = (dateStr: string | undefined): string | null => {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('/').map(Number);
  const parsedDate = new Date(year, month - 1, day);
  if (Number.isNaN(parsedDate.getTime())) return null;
  return parsedDate.toISOString().replace('Z', '-03:00');
};

// Mapa estático de canais (fallback caso channelField.values não esteja disponível)
const channelMap: Record<string, string> = {
  '1': 'Email',
  '2': 'SMS',
  // Adicione outros canais conforme necessário
};

// Função para mapear ID do canal para o nome do canal
const mapChannelIdToName = (channelId: string, channelOptions: any[]): string => {
  if (channelOptions.length > 0) {
    const channel = channelOptions.find(
      (opt) => (opt.id || opt.value || opt) === channelId
    );
    return channel ? (channel.label || channel.value || channel) : channelId;
  }
  return channelMap[channelId] || channelId;
};

// Função para extrair valores do template para a etapa 1 (sem mapear quantidades de disparo)
const extractFormValues = (data: any, channelOptions: any[]) => {
  if (!data) return {};

  const core = data.campaign?.core || {};
  const channels = data.campaign?.channels || [];

  const initialValues = {
    campaign_name: core.campaign_name || '',
    campaign_objective: core.campaign_objective ? [core.campaign_objective] : [],
    campaign_type: core.campaign_type ? [core.campaign_type] : [],
    
    offer: core.offer || '',
    campaign_codes: core.code || '',
    start_date: parseDate(core.start_date) || null,
    end_date: parseDate(core.end_date) || null,
    is_continuous: core.is_template === false, // Ajuste conforme a lógica de is_continuous
    // Removido o mapeamento das quantidades de disparo para deixar o usuário escolher novamente
  };

  console.log('Valores iniciais mapeados:', initialValues); // Log para depuração
  return initialValues;
};

export default function BasicInfoPage() {
  const [templateData, setTemplateData] = useState<any | null>(null);

  // Carregar dados do sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('briefing_template_data');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('Dados do sessionStorage:', parsed); // Log para depuração
        setTemplateData(parsed);
      } catch (error) {
        console.error('Erro ao parsear dados do template:', error);
        toast.error('Erro ao carregar dados do template.');
        setTemplateData(null);
      }
    }
  }, []);

  // Inicializar o formulário com valores padrão
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
    reset,
    ...methods
  } = useBasicInfoForm({});

  
  useEffect(() => {
    if (templateData && channelField) {
      const initialValues = extractFormValues(templateData, channelField.values || []);
      console.log('Atualizando formulário com valores:', initialValues); 
      reset(initialValues); 
      
      sessionStorage.removeItem('briefing_template_data');
    }
  }, [templateData, channelField, reset]);

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

  return (
    <Box>
      <FormStepper />
      <Box sx={{ mt: 4 }}>
        {/* @ts-ignore */}
        <Form methods={{ control, handleSubmit, ...methods }} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
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
                <RHFDatePicker
                  name="start_date"
                  slotProps={{
                    popper: {
                      sx: {
                        '& .MuiPaper-root': {
                          '& .MuiPickersDay-root': {
                            '&:hover': {
                              backgroundColor: '#f0f8ff',
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#f0f8ff',
                              color: '#093366',
                              '&:hover': {
                                backgroundColor: '#e6f3ff',
                              },
                            },
                          },
                        },
                      },
                    },
                  }}
                />
              </FieldWithLabel>
            </Grid>

            <Grid item xs={12} md={6}>
              <FieldWithLabel label="Data de Fim da Campanha">
                <RHFDatePicker
                  name="end_date"
                  slotProps={{
                    popper: {
                      sx: {
                        '& .MuiPaper-root': {
                          '& .MuiPickersDay-root': {
                            '&:hover': {
                              backgroundColor: '#f0f8ff',
                            },
                            '&.Mui-selected': {
                              backgroundColor: '#f0f8ff',
                              color: '#093366',
                              '&:hover': {
                                backgroundColor: '#e6f3ff',
                              },
                            },
                          },
                        },
                      },
                    },
                  }}
                />
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
                <Button
                  variant="outlined"
                  type="button"
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