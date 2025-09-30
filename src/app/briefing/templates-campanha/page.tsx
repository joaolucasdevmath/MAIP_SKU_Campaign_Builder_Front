'use client';

import type Template from 'src/types/templatesTypes';

import React, { useState, useEffect } from 'react';

import {
  Box,
  Card,
  Grid,
  Button,
  Dialog,
  Container,
  Typography,
  CardContent,
  DialogTitle,
  DialogContent,
} from '@mui/material';

import { useTemplate } from 'src/hooks/useTemplate';

import { Iconify } from 'src/components/iconify';
import { SplashScreen } from 'src/components/loading-screen';

export default function TemplatesPage() {
  const { templates, isLoading, fetchTemplates } = useTemplate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = (template: Template) => {
    setSelectedTemplate(template);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTemplate(null);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {isLoading ? (
          <Box sx={{ mt: 4, minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SplashScreen portal={false} />
                  </Box>
        ) : Array.isArray(templates) ? (
          <Grid container spacing={3}>
            {templates.length === 0 ? (
              <Typography variant="body1">Nenhum template encontrado.</Typography>
            ) : (
              templates.map((template) => (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Card sx={{ boxShadow: 2 }}>
                    <CardContent>
                      <Typography variant="h5">{template.campaign_name || 'Sem nome'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                         {template.description || 'Sem descrição'}
                      </Typography>


                      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mt: 1, mb: 1 }}>
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
                            ml:2,
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
                        {template.start_date || 'Não definido'} -{' '}
                        {template.end_date || 'Não definido'}
                      </Typography>

                      
                      <Typography variant="body2" color="text.secondary">
                       <Iconify icon="ic:baseline-email" width={18} sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Canais: {template.channels || 'Não definido'}
                      </Typography>

                      <Box display="flex" justifyContent="center" alignItems="center">
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenModal(template)}
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
                          Revisar/Editar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        ) : (
          <Typography variant="body1">Erro: Dados de templates inválidos.</Typography>
        )}

        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>Detalhes do Template</DialogTitle>
          <DialogContent>
            {selectedTemplate && (
              <>
                <Typography variant="h6">{selectedTemplate.campaign_name || 'Sem nome'}</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Descrição: {selectedTemplate.description || 'Sem descrição'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  ID: {selectedTemplate.id || 'Não definido'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Início: {selectedTemplate.start_date || 'Não definido'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Fim: {selectedTemplate.end_date || 'Não definido'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Oferta: {selectedTemplate.offer || 'Não definida'}
                </Typography>
                <Button onClick={handleCloseModal} sx={{ mt: 2 }}>
                  Fechar
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
}
