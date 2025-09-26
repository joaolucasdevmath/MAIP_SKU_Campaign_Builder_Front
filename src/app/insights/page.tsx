'use client';

// eslint-disable-next-line import/no-extraneous-dependencies
import jsPDF from 'jspdf';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { LoadingButton } from '@mui/lab';
import {
  Box,
  Card,
  Grid,
  Chip,
  Button,
  Typography,
  CardContent,
  CircularProgress,
} from '@mui/material';

import { useAudienceData } from 'src/hooks/useAudienceData';
import { useAudienceQuery } from 'src/hooks/useAudienceQuery';
import { useAudiencePayload } from 'src/hooks/useAudiencePayload';

import { useFormWizard } from 'src/context/FormWizardContext';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

export default function Insights() {
  const router = useRouter();
  const { state } = useFormWizard();
  const payload = useAudiencePayload();
  const { loading, error, data, runAudienceFlow } = useAudienceData();
  const { generatedQuery } = useAudienceQuery();
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    if (payload.query_text && !data && !loading && !error) {
      runAudienceFlow(payload);
    }
  }, [payload, data, loading, error, runAudienceFlow]);

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const formatNumber = (value: number): string => new Intl.NumberFormat('pt-BR').format(value);

  const parseCurrency = (currencyString: string): number => {
    if (!currencyString) return 0;
    let cleaned = currencyString.replace(/[^\d.,]/g, '').trim();
    if (cleaned.includes(',')) {
      cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    }
    return parseFloat(cleaned) || 0;
  };

  const generatePDF = () => {
    setPdfLoading(true);
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();

    // Configurações iniciais
    doc.setFontSize(16);
    doc.text('RELATÓRIO COMPLETO DA CAMPANHA', 10, 10);
    doc.setFontSize(10);
    doc.text(`Relatório Gerado em: 26/09/2025 às 15:38`, 10, 15);

    // Seção 1: Informações Básicas da Campanha
    doc.setFontSize(12);
    doc.text('1. INFORMAÇÕES BÁSICAS DA CAMPANHA', 10, 25);
    doc.setFontSize(10);
    doc.text(`Nome da Campanha: ${state.campaignName || 'Não definido'}`, 10, 30);
    doc.text(`Nome da Jornada: ${payload.additional_info?.base_origin || 'Não definido'}`, 10, 35);
    doc.text('Código da Campanha: Não definido', 10, 40);
    doc.text(`Ofertas: ${state.offers || 'Não definido'}`, 10, 45);
    doc.text(`Tipo de Campanha: ${state.campaignType || 'Não definido'}`, 10, 50);
    doc.text(`Objetivo da Campanha: ${state.campaignGoal || 'Não definido'}`, 10, 55);
    doc.text(`Marca: ${state.brand || 'Não definido'}`, 10, 60);
    doc.text('Semestre: Não definido', 10, 65);

    // Seção 2: Configurações de Disparo
    doc.setFontSize(12);
    doc.text('2. CONFIGURAÇÕES DE DISPARO', 10, 75);
    doc.setFontSize(10);
    doc.text(`Tipos de Disparo: ${Object.keys(payload.channels || {}).join(', ') || 'Não definido'}`, 10, 80);
    doc.text(`Quantidades por Tipo: ${Object.entries(payload.channels || {})
      .map(([key, value]) => `${key}: ${formatNumber(value)}`)
      .join(', ') || 'Não definido'}`, 10, 85);
    doc.text('Data de Início: 26/09/2025', 10, 90);
    doc.text('Data de Fim: 30/09/2025', 10, 95);

    // Seção 3: Definição do Público
    doc.setFontSize(12);
    doc.text('3. DEFINIÇÃO DO PÚBLICO', 10, 105);
    doc.setFontSize(10);
    doc.text(`Bases de Origem: ${payload.additional_info?.base_origin || 'Não definido'}`, 10, 110);
    doc.text('Etapas do Funil: Não definido', 10, 115);

    // Seção 4: Filtros Avançados
    doc.setFontSize(12);
    doc.text('4. FILTROS AVANÇADOS', 10, 125);
    doc.setFontSize(10);
    doc.text('Nível de Ensino: Não definido', 10, 130);
    doc.text('Modalidades: Não definido', 10, 135);
    doc.text('Cursos Incluídos: Todos os cursos', 10, 140);
    doc.text('Cursos Excluídos: Nenhum', 10, 145);
    doc.text('Forma de Ingresso: Não definido', 10, 150);
    doc.text('Documentação Enviada: Não', 10, 155);

    // Seção 5: Configurações Operacionais
    doc.setFontSize(12);
    doc.text('5. CONFIGURAÇÕES OPERACIONAIS', 10, 165);
    doc.setFontSize(10);
    doc.text('Atualização Automática: Não', 10, 170);
    doc.text('Call Center Disponível: Não definido', 10, 175);

    // Seção 6: Filtros Dinâmicos
    doc.setFontSize(12);
    doc.text('6. FILTROS DINÂMICOS', 10, 185);
    doc.setFontSize(10);
    doc.text('Status Vestibular: Não definido', 10, 190);

    // Seção 7: Informações da Audiência
    doc.setFontSize(12);
    doc.text('7. INFORMAÇÕES DA AUDIÊNCIA', 10, 200);
    doc.setFontSize(10);
    doc.text(`Tamanho da Audiência: ${data?.audience_volume ? `${formatNumber(data.audience_volume)} contatos` : 'Não definido'}`, 10, 205);
    doc.text('Taxa de Abertura Estimada: 32%', 10, 210);
    doc.text(`Custo por Contato: ${data?.estimated_costs?.Total && data.audience_volume ? formatCurrency(parseCurrency(data.estimated_costs.Total) / data.audience_volume) : 'Não definido'}`, 10, 215);
    doc.text(`Custo Total Estimado: ${data?.estimated_costs?.Total ? formatCurrency(parseCurrency(data.estimated_costs.Total)) : 'Não definido'}`, 10, 220);

    // Seção 8: Queries Geradas
    doc.setFontSize(12);
    doc.text('8. QUERIES GERADAS', 10, 230);
    doc.setFontSize(10);
    doc.text('Query 1:', 10, 235);
    doc.text(`Etapa: ${payload.additional_info?.base_origin === 'DE_GERAL_LEADS' ? 'LEAD' : 'OPORTUNIDADE'}`, 15, 240);
    doc.text(`Base: ${payload.additional_info?.base_origin || 'Não definido'}`, 15, 245);
    doc.text(`Contatos: ${data?.audience_volume || 'Não definido'}`, 15, 250);
    doc.text(`SQL: ${generatedQuery || 'Nenhuma query gerada'}`, 15, 255);

    // Seção 9: Análise de Custo-Benefício
    doc.setFontSize(12);
    doc.text('9. ANÁLISE DE CUSTO-BENEFÍCIO', 10, 265);
    doc.setFontSize(10);
    doc.text(`Custo por Contato: ${data?.estimated_costs?.Total && data.audience_volume ? formatCurrency(parseCurrency(data.estimated_costs.Total) / data.audience_volume) : 'Não definido'}`, 10, 270);
    doc.text(`Custo Total Estimado: ${data?.estimated_costs?.Total ? formatCurrency(parseCurrency(data.estimated_costs.Total)) : 'Não definido'}`, 10, 275);
    doc.text(`Tamanho da Audiência: ${data?.audience_volume ? `${formatNumber(data.audience_volume)} contatos` : 'Não definido'}`, 10, 280);

    // Salva o PDF
    doc.save('relatorio_campanha.pdf');
    setPdfLoading(false);
    toast.success('PDF gerado e baixado com sucesso!');
  };

 if (loading && !data) {
  return (
    <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Box>
  );
}

return (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#093366' }}>3. Insights e Benchmark da Campanha</Typography>
    <Grid container spacing={3}>
      {/* Coluna da esquerda: Métricas + Custos */}
      <Grid item xs={12} md={8}>
        <Card sx={{ boxShadow: 2, borderRadius: 2, mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Iconify icon="mdi:chart-bar" sx={{ mr: 1, color: '#093366' }} /> Métricas da Campanha
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    Valor da Campanha
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#093366' }}>
                    {data?.estimated_costs?.Total
                      ? formatCurrency(parseCurrency(data.estimated_costs.Total))
                      : 'R$ 0,00'}
                  </Typography>
                  <Chip label="Investimento" size="small" sx={{ mt: 1, backgroundColor: '#093366' }} />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    Tamanho da Audiência
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#093366' }}>
                    {data?.audience_volume ? formatNumber(data.audience_volume) : '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    contatos
                  </Typography>
                  <Chip label="Alcance" size="small" sx={{ mt: 1, backgroundColor: '#093366' }} />
                </Box>
              </Grid>
            </Grid>
           
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Iconify icon="mdi:cash" sx={{ mr: 1, color: '#093366' }} /> Custos por Canal
            </Typography>
            <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, width: 250 }}>
              <Typography variant="body2" color="text.secondary">
                Canal
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Email
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Custo Total
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#093366' }}>
                {data?.estimated_costs?.email
                  ? formatCurrency(parseCurrency(data.estimated_costs.email))
                  : 'R$ 0,00'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Coluna da direita: Gerador de Nome + Resumo */}
      <Grid item xs={12} md={4}>
        <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#093366' }}>
              Gerador de Nome da Campanha
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">Marca: <b>{state.nom_grupo_marca || '-'}</b></Typography>
              <Typography variant="body2">Objetivo: <b>{state.campaignObjective|| '-'}</b></Typography>
              <Typography variant="body2">Etapa de Funil: <b>Leads</b></Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Nome da Campanha
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {state.campaignName || '-'}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Nome da Régua/Jornada
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
              {payload.additional_info?.base_origin || '-'}
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#093366' }}>
              Resumo da Campanha
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Nome da Campanha: <b>{state.campaignName || '-'}</b>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Período: 26/09/2025 - 30/09/2025
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Tipos de Disparo: <Chip label="Email" size="small" sx={{ backgroundColor: '#093366' }} />
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Público-alvo: <b>Classificados</b>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Tamanho da Audiência: <b>{data?.audience_volume ? formatNumber(data.audience_volume) : '-'} </b> contatos
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Custo Total: <b>{data?.estimated_costs?.Total
                ? formatCurrency(parseCurrency(data.estimated_costs.Total))
                : 'R$ 0,00'}</b>
            </Typography>

            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <LoadingButton
                variant="contained"
                startIcon={<Iconify icon="eva:download-outline" />}
                loading={pdfLoading}
                onClick={generatePDF}
                sx={{ backgroundColor: '#093366', '&:hover': { backgroundColor: '#07264d' } }}
              >
                Finalizar e Exportar PDF
              </LoadingButton>
              <Button
                variant="outlined"
                sx={{ color: '#093366', borderColor: '#093366' }}
                onClick={() => router.push('/audience')}
              >
                Voltar para Audiência
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);
}