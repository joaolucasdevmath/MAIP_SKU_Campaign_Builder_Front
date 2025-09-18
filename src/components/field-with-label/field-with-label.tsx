import { Box, Typography } from '@mui/material';

interface FieldWithLabelProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FieldWithLabel = ({ label, required = false, children }: FieldWithLabelProps) => (
  <Box>
    <Typography 
      variant="body2" 
      sx={{ 
        mb: 1, 
        fontWeight: 500, 
        color: 'text.primary',
        fontSize: '0.875rem'
      }}
    >
      {label} {required && <span style={{ color: '#d32f2f' }}>*</span>}
    </Typography>
    {children}
  </Box>
);