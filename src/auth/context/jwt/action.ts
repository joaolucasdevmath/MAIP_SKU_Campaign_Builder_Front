'use client';

import axios, { endpoints } from 'src/utils/axios';

import { setSession } from './utils';
import { STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }: SignInParams): Promise<void> => {
  // Implemente aqui o login real, removendo o token fake
  // Exemplo:
  // const params = { email, password };
  // const res = await axios.post(endpoints.auth.signIn, params);
  // const { accessToken } = res.data;
  // if (!accessToken) throw new Error('Access token not found in response');
  // setSession(accessToken);
  throw new Error('Login básico desabilitado. Use MSAL ou implemente login real.');
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  email,
  password,
  firstName,
  lastName,
}: SignUpParams): Promise<void> => {
  // Implemente aqui o cadastro real, removendo o token fake
  // Exemplo:
  // const params = { email, password, firstName, lastName };
  // const res = await axios.post(endpoints.auth.signUp, params);
  // const { accessToken } = res.data;
  // if (!accessToken) throw new Error('Access token not found in response');
  // sessionStorage.setItem(STORAGE_KEY, accessToken);
  throw new Error('Cadastro básico desabilitado. Use MSAL ou implemente cadastro real.');
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
