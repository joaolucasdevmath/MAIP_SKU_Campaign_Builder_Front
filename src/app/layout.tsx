// ----------------------------------------------------------------------

import type { Viewport } from 'next';

import Head from 'next/head';

import { CONFIG } from 'src/config-global';
import { primary } from 'src/theme/core/palette';
import { LocalizationProvider } from 'src/locales';
import { detectLanguage } from 'src/locales/server';
import { I18nProvider } from 'src/locales/i18n-provider';
import { ThemeProvider } from 'src/theme/theme-provider';
import { FormWizardProvider } from 'src/context/FormWizardContext';
import { getInitColorSchemeScript } from 'src/theme/color-scheme-script';

import { Snackbar } from 'src/components/snackbar';
import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { detectSettings } from 'src/components/settings/server';
import NavbarWrapper from 'src/components/NavbarWrapper/NavbarWrapper';
import { defaultSettings, SettingsProvider } from 'src/components/settings';

import MsalClientProvider from 'src/auth/context/jwt/MsalClientProvider';

// ----------------------------------------------------------------------

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: primary.main,
};

type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  const lang = CONFIG.isStaticExport ? 'en' : await detectLanguage();
  const settings = CONFIG.isStaticExport ? defaultSettings : await detectSettings();

  return (
    <html lang={lang ?? 'en'} suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/assets/illustrations/math.png" type="image/png" />
        <meta name="theme-color" content={primary.main} />
        <meta name="description" content="AI Campaign Builder" />
        <meta property="og:image" content="/assets/illustrations/math.png" />
      </Head>
      <body>
        {getInitColorSchemeScript}
        <MsalClientProvider>
          <FormWizardProvider>
            <NavbarWrapper />
            <div style={{ marginTop: 64 }}>
              <I18nProvider lang={CONFIG.isStaticExport ? undefined : lang}>
                <LocalizationProvider>
                  <SettingsProvider
                    settings={settings}
                    caches={CONFIG.isStaticExport ? 'localStorage' : 'cookie'}
                  >
                    <ThemeProvider>
                      <MotionLazy>
                        <Snackbar />
                        <ProgressBar />
                        {children}
                      </MotionLazy>
                    </ThemeProvider>
                  </SettingsProvider>
                </LocalizationProvider>
              </I18nProvider>
            </div>
          </FormWizardProvider>
        </MsalClientProvider>
      </body>
    </html>
  );
}
