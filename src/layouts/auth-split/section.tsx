import type { BoxProps } from '@mui/material/Box';
import type { Breakpoint } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { Stack } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/config-global';
import { varAlpha, bgGradient } from 'src/theme/styles';

// ----------------------------------------------------------------------

type SectionProps = BoxProps & {
  title?: string;
  method?: string;
  imgUrl?: string;
  subtitle?: string;
  layoutQuery: Breakpoint;
  methods?: {
    path: string;
    icon: string;
    label: string;
  }[];
};

export function Section({
  sx,
  method,
  layoutQuery,
  methods,
  title = 'MATH',
  imgUrl = `${CONFIG.site.basePath}/assets/illustrations/yduqs.png`,
  subtitle = 'AI CAMPING BUILDER',
  ...other
}: SectionProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        color: theme.palette.grey[300],

        ml: 18,
        pb: 6,

        maxWidth: 480,
        display: 'none',
        position: 'relative',
        pt: 'var(--layout-header-desktop-height)',
        [theme.breakpoints.up(layoutQuery)]: {
          gap: 8,
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        },
        ...sx,
      }}
      {...other}
    >
  
      <div>
        <Typography
          variant="h1"
          sx={{
            textAlign: 'center',
            color: theme.palette.common.black,
            fontWeight: 800,
            letterSpacing: 2,
            mb: 1,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            sx={{
              color: theme.palette.common.black,
              textAlign: 'center',
              fontStyle: 'Roboto',
              fontWeight: 500,
              fontSize: 18,
              mt: 1,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </div>
      <Typography variant="body1" color="text.secondary" mb={4} sx={{ mt: -8 }}>
        Geração de Briefings para Marketing
      </Typography>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="black"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </Box>
            <Typography color="text.primary">Gere briefings para campanhas em segundos</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="black"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </Box>
            <Typography color="text.primary">
              Automatize segmentações e públicos de campanhas
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke="black"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="20" x2="12" y2="10" />
                <line x1="18" y1="20" x2="18" y2="4" />
                <line x1="6" y1="20" x2="6" y2="16" />
              </svg>
            </Box>
            <Typography color="text.primary">
              Padronize a criação dos briefings no seu negócio
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
