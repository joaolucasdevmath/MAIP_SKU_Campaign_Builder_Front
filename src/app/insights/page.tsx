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
} from '@mui/material';

import { useArchive } from 'src/hooks/useArchive';
import { useAudienceData } from 'src/hooks/useAudienceData';
import { useAudienceQuery } from 'src/hooks/useAudienceQuery';
import { useBriefingReview } from 'src/hooks/useBriefingReview';
import { useAudiencePayload } from 'src/hooks/useAudiencePayload';

import { useFormWizard } from 'src/context/FormWizardContext';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { SplashScreen } from 'src/components/loading-screen';

interface AudiencePayload {
  campaign_name?: string;
  campaign_type?: string[];
  channels?: Record<string, number>;
  query_text?: string;
  additional_info?: {
    base_origin?: string;
    nom_grupo_marca?: string;
    segmentations?: string;
    forma_ingresso?: any[];
  };
  start_date?: string;
  end_date?: string;
  campaign_objective?: string[];
  nom_grupo_marca?: string;
}


export default function Insights() {
  const router = useRouter();
  const { state } = useFormWizard();
  const {
     
      handleBackToBasicInfo,
     
    } = useBriefingReview();
  const payload = useAudiencePayload() as AudiencePayload;
  const { loading, error, data, runAudienceFlow } = useAudienceData();
  const { generatedQuery, clearAllData } = useAudienceQuery();
  const [pdfLoading, setPdfLoading] = useState(false);
  const { updateArchiveStatus } = useArchive();
  const [blockRedirect, setBlockRedirect] = useState(false);

 
  useEffect(() => {
    if (blockRedirect) return;
    const hasAudience = !!(state.generatedQuery || state.generated_query);
    if (!hasAudience) {
      router.replace('/audience');
    }
  }, [state, router, blockRedirect]);

  useEffect(() => {
    if (payload.query_text && !data && !loading && !error) {
      // @ts-ignore
      runAudienceFlow(payload);
    }
  }, [payload, data, loading, error, runAudienceFlow]);
  console.log('Payload: aqui', payload);
  console.log('State:', state);

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
  const funnelStageMap: Record<string, string> = {
    DE_GERAL_LEADS: 'LEAD',
    DE_GERAL_OPORTUNIDADE: 'OPORTUNIDADE',
  };

  const funnelStagee = payload.additional_info?.base_origin
    ? funnelStageMap[payload.additional_info.base_origin] || 'Não definido'
    : 'Não definido';

  const generatePDF = async () => {
    setPdfLoading(true);
    try {
      
      // eslint-disable-next-line new-cap
      const doc = new jsPDF();

      // Dados dinâmicos
      const campaignName = payload.campaign_name || state.campaign_name || 'Não definido';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const brand = state.nom_grupo_marca || payload.nom_grupo_marca || 'Não definido';
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  

      // Objetivo da campanha
      const campaignObjective = state.campaign_objective
        ? Array.isArray(state.campaign_objective)
          ? state.campaign_objective.join(', ')
          : state.campaign_objective
        : payload.campaign_objective?.join(', ') || 'Não definido';

      // Ofertas
      const offers = state.offer || 'Não definido';

      // Código da campanha
      const campaignCode = state.campaign_codes || 'Não definido';

      // Semestre (extraído do generated_query, se disponível)
      const semester =
        state.nom_periodo_academico?.join(', ') ||
        (state.generated_query?.includes('nom_periodo_academico') ? '2025.1' : 'Não definido');

      // Função para validar datas
      interface IsValidDateFn {
        (dateString: string): boolean;
      }

      const isValidDate: IsValidDateFn = (dateString) => {
        const date = new Date(dateString);
        return date instanceof Date && !Number.isNaN(date.getTime());
      };

      // Data de início
      const startDate =
        state.start_date && isValidDate(state.start_date)
          ? new Date(state.start_date).toLocaleDateString('pt-BR')
          : payload.start_date && isValidDate(payload.start_date)
            ? new Date(payload.start_date).toLocaleDateString('pt-BR')
            : 'Não definido';

      // Data de fim
      const endDate =
        state.end_date && isValidDate(state.end_date)
          ? new Date(state.end_date).toLocaleDateString('pt-BR')
          : payload.end_date && isValidDate(payload.end_date)
            ? new Date(payload.end_date).toLocaleDateString('pt-BR')
            : 'Não definido';

      // Etapas do funil
      const funnelStage = state.etapa_funil || 'Não definido';

      // Nível de ensino
      const courseLevel = state.atl_niveldeensino__c
        ? Array.isArray(state.atl_niveldeensino__c)
          ? state.atl_niveldeensino__c.join(', ')
          : state.atl_niveldeensino__c
        : 'Não definido';

      // Modalidades
      const modalities = state.modalidade
        ? Array.isArray(state.modalidade)
          ? state.modalidade.join(', ')
          : state.modalidade
        : 'Não definido';

      // Forma de ingresso
      const entryForms = [];
      if (state.forma_ingresso_enem) entryForms.push('ENEM');
      if (state.forma_ingresso_transferencia_externa) entryForms.push('Transferência Externa');
      if (state.forma_ingresso_vestibular) entryForms.push('Vestibular');
      if (state.forma_ingresso_ingresso_simplificado) entryForms.push('Ingresso Simplificado');
      const entryFormText = entryForms.length > 0 ? entryForms.join(', ') : 'Não definido';

      // Call Center Disponível
      const callCenter = state.disponibilizacao_call_center_sim
        ? 'Sim'
        : state.disponibilizacao_call_center_nao
          ? 'Não'
          : 'Não definido';

      // Status Vestibular
      const vestibularStatus = state.status_vestibular || 'Não definido';

      // Seção 1: Informações Básicas da Campanha
      doc.setFontSize(12);
      doc.text('1. INFORMAÇÕES BÁSICAS DA CAMPANHA', 10, 25);
      doc.setFontSize(10);
      doc.text(`Nome da Campanha: ${campaignName}`, 10, 30);
      // Nome da Jornada: prioriza state.journey_name, senão data.journey_name, senão base_origin
      const journeyName = state.journey_name || data?.journey_name || payload.additional_info?.base_origin || 'Não definido';
      doc.text(`Nome da Jornada: ${journeyName}`, 10, 35);
      doc.text(`Código da Campanha: ${campaignCode}`, 10, 40);
      doc.text(`Ofertas: ${offers}`, 10, 45);
      doc.text(
        `Tipo de Campanha: ${Array.isArray(payload.campaign_type) ? payload.campaign_type.join(', ') : payload.campaign_type || state.campaign_type || 'Não definido'}`,
        10,
        50
      );
      doc.text(`Objetivo da Campanha: ${campaignObjective}`, 10, 55);
      // doc.text(`Marca: ${brand}`, 10, 60);
      doc.text('Marca: MARCA', 10, 60);
      doc.text(`Semestre: ${semester}`, 10, 65);

      // Seção 2: Configurações de Disparo
      doc.setFontSize(12);
      doc.text('2. CONFIGURAÇÕES DE DISPARO', 10, 75);
      doc.setFontSize(10);
      doc.text(
        `Tipos de Disparo: ${Object.keys(payload.channels || {}).join(', ') || 'Não definido'}`,
        10,
        80
      );
      doc.text(
        `Quantidades por Tipo: ${
          Object.entries(payload.channels || {})
            .map(([key, value]) => `${key}: ${formatNumber(value)}`)
            .join(', ') || 'Não definido'
        }`,
        10,
        85
      );
      doc.text(`Data de Início: ${startDate}`, 10, 90);
      doc.text(`Data de Fim: ${endDate}`, 10, 95);

      // Seção 3: Definição do Público
      doc.setFontSize(12);
      doc.text('3. DEFINIÇÃO DO PÚBLICO', 10, 105);
      doc.setFontSize(10);
      doc.text(
        `Bases de Origem: ${payload.additional_info?.base_origin || 'Não definido'}`,
        10,
        110
      );
      doc.text(`Etapas do Funil: ${funnelStage}`, 10, 115);

      // Seção 4: Filtros Avançados
      doc.setFontSize(12);
      doc.text('4. FILTROS AVANÇADOS', 10, 125);
      doc.setFontSize(10);
      doc.text(`Nível de Ensino: ${courseLevel}`, 10, 130);
      doc.text(`Modalidades: ${modalities}`, 10, 135);
      doc.text('Cursos Incluídos: Todos os cursos', 10, 140);
      doc.text('Cursos Excluídos: Nenhum', 10, 145);
      doc.text(`Forma de Ingresso: ${entryFormText}`, 10, 150);
      doc.text('Documentação Enviada: Não', 10, 155);

      // Seção 5: Configurações Operacionais
      doc.setFontSize(12);
      doc.text('5. CONFIGURAÇÕES OPERACIONAIS', 10, 165);
      doc.setFontSize(10);
      doc.text('Atualização Automática: Não', 10, 170);
      doc.text(`Call Center Disponível: ${callCenter}`, 10, 175);

      // Seção 6: Filtros Dinâmicos
      doc.setFontSize(12);
      doc.text('6. FILTROS DINÂMICOS', 10, 185);
      doc.setFontSize(10);
      doc.text(`Status Vestibular: ${vestibularStatus}`, 10, 190);

      // Seção 7: Informações da Audiência
      doc.setFontSize(12);
      doc.text('7. INFORMAÇÕES DA AUDIÊNCIA', 10, 200);
      doc.setFontSize(10);
      doc.text(
        `Tamanho da Audiência: ${data?.audience_volume ? `${formatNumber(data.audience_volume)} contatos` : 'Não definido'}`,
        10,
        205
      );
      doc.text('Taxa de Abertura Estimada: 32%', 10, 210);
      doc.text(
        `Custo por Contato: ${data?.estimated_costs?.Total && data.audience_volume ? formatCurrency(parseCurrency(data.estimated_costs.Total) / data.audience_volume) : 'Não definido'}`,
        10,
        215
      );
      doc.text(
        `Custo Total Estimado: ${data?.estimated_costs?.Total ? formatCurrency(parseCurrency(data.estimated_costs.Total)) : 'Não definido'}`,
        10,
        220
      );

     // Seção 8: Queries Geradas
doc.setFontSize(12);
doc.text('8. QUERIES GERADAS', 10, 230);
doc.setFontSize(10);
doc.text('Query 1:', 10, 235);
doc.text(
  `Etapa: ${payload.additional_info?.base_origin === 'DE_GERAL_LEADS' ? 'LEAD' : 'OPORTUNIDADE'}`,
  15,
  240
);
doc.text(`Base: ${payload.additional_info?.base_origin || 'Não definido'}`, 15, 245);
doc.text(`Contatos: ${data?.audience_volume || 'Não definido'}`, 15, 250);



const sqlLines = doc.splitTextToSize(`SQL: ${generatedQuery || 'Nenhuma query gerada'}`, 180);
doc.text(sqlLines, 15, 255);

// Calcula a próxima posição Y após a query para dar respiro antes da seção 9
let yAfterQuery = 255 + sqlLines.length * 5;
if (yAfterQuery < 265) yAfterQuery = 265; // nunca deixa colar na seção 9
else yAfterQuery += 8; // se for maior, dá um respiro extra

// Seção 9: Análise de Custo-Benefício
doc.setFontSize(12);
doc.text('9. ANÁLISE DE CUSTO-BENEFÍCIO', 10, yAfterQuery);
doc.setFontSize(10);
doc.text(
  `Custo por Contato: ${data?.estimated_costs?.Total && data.audience_volume ? formatCurrency(parseCurrency(data.estimated_costs.Total) / data.audience_volume) : 'Não definido'}`,
  10,
  yAfterQuery + 5
);
doc.text(
  `Custo Total Estimado: ${data?.estimated_costs?.Total ? formatCurrency(parseCurrency(data.estimated_costs.Total)) : 'Não definido'}`,
  10,
  yAfterQuery + 10
);
doc.text(
  `Tamanho da Audiência: ${data?.audience_volume ? `${formatNumber(data.audience_volume)} contatos` : 'Não definido'}`,
  10,
  yAfterQuery + 15
);

      // Salva o PDF
      doc.save('relatorio_campanha.pdf');
      toast.success('PDF gerado e baixado com sucesso!');

      // --- Atualização do status para completed ---
      let payloadToSend = null;
      const archivePayload = typeof window !== 'undefined' ? sessionStorage.getItem('archivePayload') : null;
      if (archivePayload) {
        payloadToSend = JSON.parse(archivePayload);
      } else {
        
        
       
        payloadToSend = {
          campaign: {
            core: {
              offer: state.offer || '',
              code: state.campaign_codes || state.campaignCode || '',
              campaign_name: state.campaign_name || state.campaignName || '',
              campaign_type: Array.isArray(state.campaign_type) ? state.campaign_type[0] : state.campaign_type || state.campaignType || '',
              campaign_objective: Array.isArray(state.campaign_objective) ? state.campaign_objective[0] : state.campaign_objective || state.campaignObjective || '',
              start_date: state.start_date ? state.start_date.split('T')[0] : state.campaignStartDate ? new Date(state.campaignStartDate).toISOString().split('T')[0] : '',
              end_date: state.end_date ? state.end_date.split('T')[0] : state.campaignEndDate ? new Date(state.campaignEndDate).toISOString().split('T')[0] : '',
              segmentation_sql: state.generatedQuery || state.generated_query || '',
              audience_snapshot: state.audienceInfo?.audienceSize ?? 0,
              status: 'completed',
              is_template: false,
            },
            channels: (state.channel || []).map((type: any, idx: any) => ({
              id: idx + 1,
              quantity: state[`quantity_${type}`] || 0,
            })),
          },
          briefing: {
            core: {
              name: (state.journey_name || '-'),
              segmentation: (state.segmentation || []).join(' AND '),
              source_base_id: state.source_base_id || '1',
              source_base: (state.base_origin && state.base_origin[0]) || state.source_base || '',
            },
            fields: [
              { name: 'nom_grupo_marca', value: state.nom_grupo_marca || '' },
              { name: 'modalidade', value: (state.modalidade || []).join(', ') },
              { name: 'atl_niveldeensino__c', value: (state.atl_niveldeensino__c || []).join(', ') },
              { name: 'forma_ingresso_enem', value: state.forma_ingresso_enem ? 'true' : 'false' },
              { name: 'forma_ingresso_vestibular', value: state.forma_ingresso_vestibular ? 'true' : 'false' },
              { name: 'disponibilizacao_call_center_nao', value: state.disponibilizacao_call_center_nao ? 'true' : 'false' },
              { name: 'disponibilizacao_call_center_sim', value: state.disponibilizacao_call_center_sim ? 'true' : 'false' },
              { name: 'status_funil', value: state.status_funil || '' },
              { name: 'outras_exclusoes', value: state.outras_exclusoes || '' },
              { name: 'criterios_saida', value: state.criterios_saida || '' },
              { name: 'informacoes_extras', value: state.informacoes_extras || '' },
              { name: 'base_origin', value: (state.base_origin && state.base_origin[0]) || '' },
            ],
          },
        };
      }
      // Sempre garantir que o id do draft está presente no payload
      const archiveId = typeof window !== 'undefined' ? sessionStorage.getItem('archiveId') : null;
      if (archiveId) {
        payloadToSend.campaign.core.id = archiveId;
      }
      
      try {
        const resp = await updateArchiveStatus(payloadToSend, 'completed');
        console.log('Resposta updateArchiveStatus:', resp);
      } catch (e) {
        console.error('Erro updateArchiveStatus:', e);
        toast.error('Erro ao atualizar status do histórico');
      }
    } catch (pdfError) {
      console.error('Erro ao gerar PDF:', pdfError);
      toast.error('Erro ao gerar o PDF. Tente novamente.');
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <Box sx={{ py: 4, minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <SplashScreen portal={false} />
        <Typography variant="h6" align="center" sx={{ mt: 2 }}>Carregando dados da audiência...</Typography>
      </Box>
    );
  }

  if (error && !data) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Erro ao carregar dados
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => router.push('/briefing/audience')}
          sx={{ mt: 2 }}
        >
          Voltar para Audiência
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#000' }}>
        3. Insights e Benchmark da Campanha
      </Typography>
      <Grid container spacing={3}>
       
        <Grid item xs={12} md={8}>
          <Card sx={{ boxShadow: 2, borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify icon="mdi:chart-bar" sx={{ mr: 1, color: '#093366' }} /> Métricas da
                Campanha
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, height: '100%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Valor Estimado da Campanha
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#093366' }}>
                      {data?.estimated_costs?.Total
                        ? formatCurrency(parseCurrency(data.estimated_costs.Total))
                        : 'R$ 0,00'}
                    </Typography>
                    <span>
                      <Chip
                        label="Investimento"
                        size="small"
                        sx={{ mt: 1, backgroundColor: '#093366' }}
                      />
                    </span>
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
                    <span>
                      <Chip
                        label="Alcance"
                        size="small"
                        sx={{ mt: 1, backgroundColor: '#093366' }}
                      />
                    </span>
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
              {data?.estimated_costs && Object.keys(data.estimated_costs).length > 0 ? (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {Object.entries(data.estimated_costs)
                    .filter(([canal]) => canal.toLowerCase() !== 'total')
                    .map(([canal, valor]) => (
                      <Box key={canal} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, minWidth: 180, mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Canal
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {canal.charAt(0).toUpperCase() + canal.slice(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Custo Total Estimado
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#093366' }}>
                          {valor ? formatCurrency(parseCurrency(valor as string)) : 'R$ 0,00'}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">Nenhum custo por canal disponível</Typography>
              )}
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
                <Typography variant="body2">
                  Marca: <b>MARCA</b>
                </Typography>
                <Typography variant="body2">
                  Objetivo: <b>{state.campaign_objective}</b>
                </Typography>
                <Typography variant="body2">
                  Etapa de Funil: <b>{funnelStagee}</b>
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Nome da Campanha
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {state.campaign_name}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Nome da Régua/Jornada
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
                {state.journey_name || data?.journey_name || payload.additional_info?.base_origin || '-'}
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#093366' }}>
                Resumo da Campanha
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Nome da Campanha: <b>{state.campaign_name}</b>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Período:{' '}
                <b>
                  {state.start_date
                    ? new Date(state.start_date).toLocaleDateString('pt-BR')
                    : 'Não definido'}{' '}
                  -{' '}
                  {state.end_date
                    ? new Date(state.end_date).toLocaleDateString('pt-BR')
                    : 'Não definido'}
                </b>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Tipos de Disparo:
                </Typography>
                <span>
                  <Chip label="Email" size="small" sx={{ backgroundColor: '#093366' }} />
                </span>
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Público-alvo: <b>Classificados</b>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Tamanho da Audiência:{' '}
                <b>{data?.audience_volume ? formatNumber(data.audience_volume) : '-'}</b> contatos
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Custo Total:{' '}
                <b>
                  {data?.estimated_costs?.Total
                    ? formatCurrency(parseCurrency(data.estimated_costs.Total))
                    : 'R$ 0,00'}
                </b>
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
                            onClick={() => {
                              clearAllData();
                              setBlockRedirect(true);
                              if (typeof handleBackToBasicInfo === 'function') {
                                handleBackToBasicInfo();
                              } else {
                                router.replace('/briefing/basic-info');
                              }
                            }}
                >
                  Voltar para Início
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
