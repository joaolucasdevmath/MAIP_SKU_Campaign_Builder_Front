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
  CircularProgress,
} from '@mui/material';

import { useTemplate } from 'src/hooks/useTemplate';



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
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#093366' }} /> 
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
                      <Typography variant="h6">{template.campaign_name || 'Sem nome'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Descrição: {template.description || 'Sem descrição'}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Início: {template.start_date || 'Não definido'} - Fim:{' '}
                        {template.end_date || 'Não definido'}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        Oferta: {template.offer || 'Não definida'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Canais: {template.channels || 'Não definido'}
                      </Typography>

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
                          ml: 2,
                          mt: 2,
                        }}
                      >
                        Revisar/Editar
                      </Button>

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
                          ml: 4,
                          mt: 2,
                        }}
                      >
                        Ver Detalhes
                      </Button>
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
