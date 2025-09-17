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

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';
import { signInWithPassword } from 'src/auth/context/jwt';

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
  const [loading, setLoading] = useState(false);

  function handleMicrosoftLogin() {
    setLoading(true);
    console.log('Login Microsoft');
    setTimeout(() => setLoading(false), 1200);
  }
  const router = useRouter();

  const { checkUserSession } = useAuthContext();

  const [errorMsg, setErrorMsg] = useState('');

  const password = useBoolean();

  const defaultValues = {
    email: 'demo@minimals.cc',
    password: '@demo1',
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
    try {
  await signInWithPassword({ email: data.email, password: data.password });
  router.push(paths.briefing.basicInfo);
    } catch (error) {
      console.error(error);
      setErrorMsg(error instanceof Error ? error.message : error);
    }
  });

  const renderForm = (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={600} mb={1} color="text.primary" align="center">
        Bem-vindo AI Campaign Builder
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" mb={3}>
        Acesse sua plataforma Campaign Builder
      </Typography>
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
          placeholder="6+ characters"
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
        loading={isSubmitting}
        loadingIndicator="Sign in..."
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
        onClick={() => handleMicrosoftLogin()}
        disabled={loading}
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
        loading={loading}
        loadingIndicator={loading ? 'Entrando...' : undefined}
      >
        {loading ? 'Entrando...' : 'Login com Microsoft'}
      </LoadingButton>
    </Stack>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      {renderForm}
    </Form>
  );
}
