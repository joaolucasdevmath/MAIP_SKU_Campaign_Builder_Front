'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Box, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useBasicAuth } from 'src/hooks/useBasicAuth';
import { useBackendAuth } from 'src/hooks/useBackendAuth';
import { useMicrosoftLogin } from 'src/hooks/useMicrosoftLogin';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

// ----------------------------------------------------------------------

export function JwtSignInView() {
  // Hooks de autenticação
  const router = useRouter();
  const { login, loading: basicLoading } = useBasicAuth();
  const { loginWithMicrosoft, loading: msLoading, error: msError } = useMicrosoftLogin();
  const { authenticate, loading: backendLoading } = useBackendAuth();

  const [errorMsg, setErrorMsg] = useState('');
  const password = useBoolean();
  const defaultValues = {
    email: '',
    password: '',
  };
  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  
  const onSubmit = handleSubmit(async (data) => {
    const result = await login({ email: data.email, password: data.password });
    if (result && result.success && result.data?.token) {
      
      sessionStorage.setItem('jwt_access_token', result.data.token);
      router.push(paths.briefing.basicInfo);
    } else {
      setErrorMsg(result?.errorMessage || 'Erro de autenticação');
    }
  });

  
 const handleMicrosoftLogin = async () => {
  const msAccessToken = await loginWithMicrosoft();
  if (msAccessToken) {
    
    const backendResult = await authenticate(msAccessToken);
    if (backendResult && backendResult.success && backendResult.data?.token) {
      sessionStorage.setItem('jwt_access_token', backendResult.data.token); 
      router.push(paths.briefing.basicInfo);
    } else {
      setErrorMsg(backendResult?.errorMessage || 'Erro na autenticação Microsoft');
    }
  } else {
    setErrorMsg(msError || 'Erro ao autenticar com Microsoft');
  }
};

  const renderForm = (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={600} mb={1} color="text.primary" align="center">
        Bem-vindo AI Campaign Builder
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" mb={3}>
        Acesse sua plataforma Campaign Builder
      </Typography>
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}
      <Field.Text name="email" label="Email*" InputLabelProps={{ shrink: true }} />
      <Stack spacing={1.5}>
        <Link
          component={RouterLink}
          href="#"
          variant="body2"
          color="inherit"
          sx={{ alignSelf: 'flex-end' }}
        >
          Esqueceu senha?
        </Link>
        <Field.Text
          name="password"
          label="Senha*"
          type={password.value ? 'text' : 'password'}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={password.onToggle} edge="end">
                  <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting || basicLoading}
        loadingIndicator="Entrando..."
      >
        Entrar
      </LoadingButton>
      {/* Separador e botão Microsoft */}
      <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
        <Box sx={{ flexGrow: 1, borderTop: '1px solid #e5e7eb' }} />
        <Typography
          sx={{
            px: 2,
            fontSize: 12,
            textTransform: 'uppercase',
            color: '#94a3b8',
            position: 'relative',
            zIndex: 1,
            background: 'transparent',
          }}
        >
          ou continue com
        </Typography>
        <Box sx={{ flexGrow: 1, borderTop: '1px solid #e5e7eb' }} />
      </Box>
      <LoadingButton
        type="button"
        fullWidth
        size="large"
        onClick={handleMicrosoftLogin}
        disabled={msLoading || backendLoading}
        sx={{
          fontWeight: 600,
          height: 48,
          borderRadius: 1,
          background: 'rgba(255,255,255,0.7)',
          color: '#18181b',
          boxShadow: 1,
          border: '1px solid #e5e7eb',
          textTransform: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s, transform 0.15s',
          '&:hover': { background: 'rgba(243,244,246,0.9)', transform: 'scale(1.03)' },
          '&:active': { transform: 'scale(0.97)' },
          '&:disabled': { opacity: 0.6, cursor: 'not-allowed' },
        }}
        loading={msLoading || backendLoading}
        loadingIndicator={msLoading || backendLoading ? 'Entrando...' : undefined}
      >
        {msLoading || backendLoading ? 'Entrando...' : 'Login com Microsoft'}
      </LoadingButton>
    </Stack>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      {renderForm}
    </Form>
  );
}
