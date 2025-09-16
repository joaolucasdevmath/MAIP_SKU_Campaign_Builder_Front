import type { BoxProps } from '@mui/material/Box';
import type { Breakpoint } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
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
        ...bgGradient({
          color: `0deg, ${varAlpha(theme.vars.palette.background.defaultChannel, 0.92)}, ${varAlpha(theme.vars.palette.background.defaultChannel, 0.92)}`,
          imgUrl: `${CONFIG.site.basePath}/assets/background/background-3-blur.webp`,
        }),
        px: 3,
        pb: 3,
        width: 1,
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
            fontWeight: 700, 
            letterSpacing: 2, 
            mb: 1 
          }}>
          {title}
        </Typography>

        {subtitle && (
          <Typography 
            sx={{ 
              color: theme.palette.grey[500], 
              textAlign: 'center', 
              fontStyle: 'italic', 
              fontSize: 22, 
              mt: 1 
            }}>
            {subtitle}
          </Typography>
        )}
      </div>

      <Box
        component="img"
        alt="Dashboard illustration"
        src={imgUrl}
        sx={{ width: 260, height: 200, objectFit: 'contain', mx: 'auto', mb: 2 }}
      />

      {!!methods?.length && method && (
        <Box component="ul" gap={2} display="flex">
          {methods.map((option) => {
            const selected = method === option.label.toLowerCase();

            return (
              <Box
                key={option.label}
                component="li"
                sx={{
                  ...(!selected && {
                    cursor: 'not-allowed',
                    filter: 'grayscale(1)',
                  }),
                }}
              >
                <Tooltip title={option.label} placement="top">
                  <Link
                    component={RouterLink}
                    href={option.path}
                    sx={{
                      ...(!selected && { pointerEvents: 'none' }),
                    }}
                  >
                    <Box
                      component="img"
                      alt={option.label}
                      src={option.icon}
                      sx={{ width: 32, height: 32 }}
                    />
                  </Link>
                </Tooltip>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
