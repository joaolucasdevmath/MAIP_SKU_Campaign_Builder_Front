
"use client"

import React from "react";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
// eslint-disable-next-line perfectionist/sort-imports
import { msalConfig } from "src/lib/msalConfig"; 

const msalInstance = new PublicClientApplication(msalConfig);

export default function MsalClientProvider({ children }: { children: React.ReactNode }) {
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
