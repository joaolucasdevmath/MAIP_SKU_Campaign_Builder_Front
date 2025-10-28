import { Box } from '@mui/material';

import AdminSidebar from 'src/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box display="flex" minHeight="100vh">
      <AdminSidebar />
      <Box flex={1} p={3}>
        {children}
      </Box>
    </Box>
  );
}
