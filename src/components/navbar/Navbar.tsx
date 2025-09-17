"use client";

import { usePathname } from 'next/navigation';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

const steps = [
  { name: 'Briefing', path: paths.briefing.basicInfo },
  { name: 'Audiência', path: paths.audience},
  { name: 'Insights', path: paths.insights },
];

export default function Navbar() {
  const theme = useTheme();
  const pathname = usePathname()?.replace(/\/$/, '') || '';


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
      <Box sx={{ display: 'flex', alignItems: 'center', height: 64, px: 4, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ mr: 2 }}>
            <img src="/assets/illustrations/yduqs.png" alt="YDUQS Logo" style={{ height: 30, marginLeft: 4 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.info.darker}}>
            AI Campaign Builder
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 4 }}>
          {steps.map((step) => {
            const isActive = pathname === step.path.replace(/\/$/, '');
            return (
              <Box key={step.path} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Link
                  href={step.path}
                  underline="none"
                  sx={{
                    py: 2,
                    fontWeight: 600,
                    fontSize: 16,
                    color: isActive ? '#003768' : theme.palette.grey[500],
                    transition: 'color 0.2s',
                    cursor: 'pointer',
                     
                  }}
                >
                  {step.name}
                </Link>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
