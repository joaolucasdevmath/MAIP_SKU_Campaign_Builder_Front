'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function AdminPage() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" fontWeight={700} color="primary" gutterBottom>
        Painel do Admin
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Bem-vindo, admin! Aqui você pode gerenciar o sistema, usuários e campanhas.
      </Typography>
    </Box>
  );
}
