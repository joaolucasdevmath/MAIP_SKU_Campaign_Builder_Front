'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Drawer from '@mui/material/Drawer';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';

import { useFormWizard } from 'src/context/FormWizardContext';

const steps = [
  { name: 'Briefing', path: paths.briefing.basicInfo },
  { name: 'Audiência', path: paths.audience },
  { name: 'Insights', path: paths.insights },
];

export default function Navbar() {
  const theme = useTheme();
  const pathname = usePathname()?.replace(/\/$/, '') || '';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { state } = useFormWizard();

  // Considera que a audiência foi gerada se existe generatedQuery ou generated_query
  const hasAudience = !!(state.generatedQuery || state.generated_query);

  // Permite acessar "Insights" só se já gerou audiência
  const canAccessInsights = hasAudience;
  // Permite acessar "Audiência" só se já gerou segmentação (query)
  const canAccessAudience = hasAudience;

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        bgcolor: theme.palette.common.white,
        borderBottom: `1px solid ${theme.palette.grey[200]}`,
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 64,
          px: 4,
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ mr: 2 }}>
            <img
              src="/assets/illustrations/math.png"
              alt="MATH Logo"
              style={{ height: 30, marginLeft: 4 }}
            />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontFamily: "'Public Sans', 'Inter', Arial, sans-serif",
              color: theme.palette.info.darker,
            }}
          >
            AI Campaign Builder
          </Typography>
        </Box>
        {/* Desktop links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 4 }}>
          {steps.map((step) => {
            const isActive = pathname === step.path.replace(/\/$/, '');
            let isDisabled = false;
            if (step.name === 'Audiência') {
              isDisabled = !canAccessAudience;
            } else if (step.name === 'Insights') {
              isDisabled = !canAccessInsights;
            }
            return (
              <Box
                key={step.path}
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <Link
                  href={isDisabled ? undefined : step.path}
                  underline="none"
                  sx={{
                    py: 2,
                    fontWeight: 600,
                    fontSize: 16,
                    color: isDisabled ? theme.palette.grey[300] : (isActive ? '#000' : theme.palette.grey[500]),
                    transition: 'color 0.2s',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    pointerEvents: isDisabled ? 'none' : 'auto',
                  }}
                  onClick={e => {
                    if (isDisabled) {
                      e.preventDefault();
                    }
                  }}
                  aria-disabled={isDisabled}
                >
                  {step.name}
                </Link>
              </Box>
            );
          })}
        </Box>
        {/* Mobile menu icon */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton onClick={handleDrawerOpen} edge="end" color="inherit" aria-label="menu">
            <MenuIcon fontSize="large" />
          </IconButton>
        </Box>
        <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
          <Box sx={{ width: 220, p: 2 }} role="presentation" onClick={handleDrawerClose}>
            {steps.map((step) => {
              const isActive = pathname === step.path.replace(/\/$/, '');
              let isDisabled = false;
              if (step.name === 'Audiência') {
                isDisabled = !canAccessAudience;
              } else if (step.name === 'Insights') {
                isDisabled = !canAccessInsights;
              }
              return (
                <Link
                  key={step.path}
                  href={isDisabled ? undefined : step.path}
                  underline="none"
                  sx={{
                    display: 'block',
                    py: 2,
                    fontWeight: 600,
                    fontSize: 18,
                    color: isDisabled ? theme.palette.grey[300] : (isActive ? '#000' : theme.palette.grey[500]),
                    transition: 'color 0.2s',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    pointerEvents: isDisabled ? 'none' : 'auto',
                  }}
                  onClick={e => {
                    if (isDisabled) {
                      e.preventDefault();
                    }
                  }}
                  aria-disabled={isDisabled}
                >
                  {step.name}
                </Link>
              );
            })}
          </Box>
        </Drawer>
      </Box>
    </Box>
  );
}
