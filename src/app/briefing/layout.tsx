

import { Box } from '@mui/material';

import Navbar from 'src/components/navbar';
import { BriefingMainTabs } from 'src/components/briefing';

export const metadata = {
  title: 'YDUQS',
  description: 'AI Camping Builder',
};

export default function BriefingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto px-4">
      <Navbar />
      <Box
        sx={{
          maxWidth: { xs: '95%', sm: 300, md: 900, lg: 1400 },
          width: '100%',
          mx: 'auto',
          mt: 4,
          p: { xs: 1, sm: 2, md: 3 },
          bgcolor: '#fff',
          borderRadius: 2,
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0',
        }}
      >
        <BriefingMainTabs />
        {children}
      </Box>
    </div>
  );
}
