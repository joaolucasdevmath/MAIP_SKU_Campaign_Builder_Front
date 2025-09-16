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
  // Liberação temporária: acesso sem autenticação
  // try {
  //   const params = { email, password };
  //   const res = await axios.post(endpoints.auth.signIn, params);
  //   const { accessToken } = res.data;
  //   if (!accessToken) {
  //     throw new Error('Access token not found in response');
  //   }
  //   setSession(accessToken);
  // } catch (error) {
  //   console.error('Error during sign in:', error);
  //   throw error;
  // }
    setSession('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmYWtlVXNlciIsImV4cCI6MTk5OTk5OTk5OX0.dummySignature'); // Token JWT válido (fake) para liberar acesso
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
  const params = {
    email,
    password,
    firstName,
    lastName,
  };

  // Liberação temporária: cadastro sem autenticação
  // try {
  //   const res = await axios.post(endpoints.auth.signUp, params);
  //   const { accessToken } = res.data;
  //   if (!accessToken) {
  //     throw new Error('Access token not found in response');
  //   }
  //   sessionStorage.setItem(STORAGE_KEY, accessToken);
  // } catch (error) {
  //   console.error('Error during sign up:', error);
  //   throw error;
  // }
    sessionStorage.setItem(STORAGE_KEY, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmYWtlVXNlciIsImV4cCI6MTk5OTk5OTk5OX0.dummySignature'); // Token JWT válido (fake) para liberar acesso
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
