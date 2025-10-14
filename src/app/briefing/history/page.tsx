'use client';



import { useRouter } from 'next/navigation';

import { Box, Card, Grid, Button, Container, Typography, CardContent } from '@mui/material';

import { useArchive } from 'src/hooks/useArchive';

import { Iconify } from 'src/components/iconify/iconify';
import { SplashScreen } from 'src/components/loading-screen';

export default function HistoryPage() {
  const { data: templates, loading, error, getArchiveById } = useArchive();
  const router = useRouter();


  // Função para reutilizar o briefing
  const handleReuse = async (id: string) => {
    const archiveData = await getArchiveById(id);
    if (archiveData) {
      sessionStorage.setItem('briefing_template_data', JSON.stringify(archiveData));
      router.push('/briefing/basic-info');
    }
  };

  
  const getStatusLabel = (status: string) => {
    if (status === 'draft') return 'Em andamento';
    if (status === 'completed') return 'Completado';
    return status || 'Sem status';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {loading ? (
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
        ) : error ? (
          <Typography color="error">Erro ao carregar histórico: {error}</Typography>
        ) : Array.isArray(templates) ? (
          <Grid container spacing={3}>
            {templates.length === 0 ? (
              <Typography variant="body1">Nenhum briefing encontrado.</Typography>
            ) : (
              templates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Card sx={{ boxShadow: 2 }}>
                    <CardContent>
                      <Typography variant="h5">{template.campaign_name || 'Sem nome'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {getStatusLabel(template.status)}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                          mt: 1,
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            px: 2,
                            py: 0.5,
                            borderRadius: '16px',
                            border: '1px solid #e0e3e8',
                            bgcolor: '#fff',
                            fontWeight: 500,
                            fontSize: 14,
                            color: '#18181b',
                            ml: 2,
                            boxShadow: 'none',
                            display: 'inline-block',
                          }}
                        >
                          {template.offer || 'Não definida'}
                        </Box>
                        <Box
                          sx={{
                            px: 2,
                            py: 0.5,
                            ml: 4,
                            borderRadius: '16px',
                            border: '1px solid #e0e3e8',
                            bgcolor: '#fff',
                            fontWeight: 500,
                            fontSize: 14,
                            color: '#18181b',
                            boxShadow: 'none',
                            display: 'inline-block',
                          }}
                        >
                          {template.code || 'Não definida'}
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        <Iconify
                          icon="solar:calendar-bold"
                          width={18}
                          sx={{ mr: 1, verticalAlign: 'middle' }}
                        />
                        {template.created_at}
                       
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <Iconify
                          icon="ic:baseline-email"
                          width={18}
                          sx={{ mr: 1, verticalAlign: 'middle' }}
                        />
                        Canais: {template.channels || 'Não definido'}
                      </Typography>
                      <Box display="flex" justifyContent="center" alignItems="center">
                        <Button
                          variant="outlined"
                          onClick={() => handleReuse(template.id)}
                          sx={{
                            borderColor: '#093366',
                            color: '#093366',
                            backgroundColor: 'white',
                            '&:hover': {
                              backgroundColor: '#07264d',
                              color: 'white',
                              borderColor: '#07264d',
                            },
                            mt: 2,
                          }}
                        >
                          Reutilizar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        ) : (
          <Typography variant="body1">Erro: Dados de histórico inválidos.</Typography>
        )}
      </Box>
    </Container>
  );
}
