import { useState } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useMsal } from '@azure/msal-react';

export function useMicrosoftLogin() {
  const { instance } = useMsal();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const loginWithMicrosoft = async () => {
    setLoading(true);
    setError(null);
    try {
      const loginResponse = await instance.loginPopup({
        scopes: ['api://ba8940c2-b699-4e6f-ba23-652bddf5f4c5/openid'],
      });
      setToken(loginResponse.accessToken);
      return loginResponse.accessToken;
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar com Microsoft');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loginWithMicrosoft, loading, error, token };
}
