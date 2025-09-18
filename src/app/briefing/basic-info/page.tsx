'use client'

import type { BasicInfoFormValues } from "src/types/basicInfoFormTypes";

import { Controller } from "react-hook-form";

import { DatePicker } from "@mui/x-date-pickers";
import { Box, Grid, Select, Button, MenuItem, Checkbox, TextField, Typography, Autocomplete, FormControlLabel } from "@mui/material";

import { useBasicInfoForm } from "src/hooks/useBasicInfoForm";

import { canais, basicInfoSchema } from "src/utils/schemas/basicInfoSchema";

import { useFormWizard } from "src/context/FormWizardContext";

import { FormStepper } from "src/components/form-stepper";



export default function BasicInfoPage() {
  const stepTitles = [
    "Etapa 1 de 4: Informações Básicas",
    "Etapa 2 de 4: Definição do Público",
    "Etapa 3 de 4: Filtros Avançados",
    "Etapa 4 de 4: Revisão e Geração",
  ];

  

  const { updateCampaignData, state } = useFormWizard();

  const { control, handleSubmit, watch } = useBasicInfoForm(state);

  const channel = watch("channel");


  const onSubmit = (data: BasicInfoFormValues) => {
    updateCampaignData(data);
    // Navegar para próxima etapa (implementar navegação)
  };

  return (
    <Box component="main" sx={{ bgcolor: "#fff", minHeight: "100vh", py: 4 }}>
      <Box mb={4}>
        <FormStepper currentStep={1} totalSteps={4} stepTitles={stepTitles} />
      </Box>
      <Box sx={{ bgcolor: "#fff", borderRadius: 3, p: 4, maxWidth: 1100, mx: "auto" }}>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="campaignName"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField {...field} label="Nome da Campanha" fullWidth required error={!!fieldState.error} helperText={fieldState.error?.message} />
                )}
              />
              <Typography variant="caption">Nome da campanha para identificação e organização.</Typography>
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="campaignType"
                control={control}
                render={({ field, fieldState }) => (
                  <Select {...field} label="Tipo da Campanha" fullWidth required error={!!fieldState.error}>
                    <MenuItem value="">Selecione o tipo</MenuItem>
                    <MenuItem value="Captacao">Captação</MenuItem>
                    <MenuItem value="Retencao">Retenção</MenuItem>
                    <MenuItem value="Renovacao">Renovação</MenuItem>
                  </Select>
                )}
              />
              <Typography variant="caption">Tipo principal da campanha.</Typography>
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="campaignObjective"
                control={control}
                render={({ field, fieldState }) => (
                  <Select {...field} label="Objetivo da Campanha" fullWidth required error={!!fieldState.error}>
                    <MenuItem value="">Selecione o objetivo</MenuItem>
                    <MenuItem value="Inscricao">Inscrição</MenuItem>
                    <MenuItem value="Engajamento">Engajamento/Nutrição</MenuItem>
                    <MenuItem value="Financeira">Matrícula Financeira</MenuItem>
                    <MenuItem value="Academica">Matrícula Acadêmica</MenuItem>
                    <MenuItem value="Reabertura">Reabertura</MenuItem>
                  </Select>
                )}
              />
              <Typography variant="caption">Objetivo específico da campanha.</Typography>
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="offer"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField {...field} label="Oferta(s)" fullWidth required error={!!fieldState.error} helperText={fieldState.error?.message} />
                )}
              />
              <Typography variant="caption">Descreva as ofertas desta campanha para histórico e referência futura.</Typography>
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="campaignCode"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Código da Campanha (Opcional)" fullWidth />
                )}
              />
              <Typography variant="caption">Código interno para identificação e rastreamento da campanha.</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="channel"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={canais}
                    getOptionLabel={option => option.label}
                    renderInput={params => <TextField {...params} label="Tipo de Disparo" fullWidth required />}
                    value={field.value}
                    onChange={(_, value) => field.onChange(value)}
                  />
                )}
              />
              <Typography variant="caption">Selecione os tipos de disparo para esta campanha.</Typography>
              {channel && (
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField {...field} label={`Quantidade de Disparos para ${channel.label}`} fullWidth required error={!!fieldState.error} helperText={fieldState.error?.message} sx={{ mt: 2 }} />
                  )}
                />
              )}
            </Grid>
            <Grid item xs={12} md={3}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Data de Início da Campanha"
                    value={field.value}
                    onChange={field.onChange}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
              <Typography variant="caption">Data de início da campanha.</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Data de Fim da Campanha"
                    value={field.value}
                    onChange={field.onChange}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                )}
              />
              <Typography variant="caption">Data de término da campanha.</Typography>
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="isContinuous"
                control={control}
                render={({ field }) => (
                  <FormControlLabel control={<Checkbox checked={field.value} onChange={e => field.onChange(e.target.checked)} />} label="Campanha Contínua" />
                )}
              />
              <Typography variant="caption">Marque esta opção para campanhas sem data de fim prevista.</Typography>
            </Grid>
            <Grid item xs={12} display="flex" justifyContent="space-between">
              <Button variant="outlined" color="error" type="button">Limpar</Button>
              <Button variant="contained" color="primary" type="submit">Próximo</Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
}