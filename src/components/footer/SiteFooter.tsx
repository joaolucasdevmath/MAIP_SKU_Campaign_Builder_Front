import React from 'react';

type Props = {
  version?: string;
};

export default function SiteFooter({ version = '1.0.0' }: Props) {
  return (
    <footer
      style={{
        width: '100%',
        textAlign: 'center',
        padding: '12px 0',
        fontSize: 13,
        color: 'rgba(0,0,0,0.6)',
      }}
      aria-label="application-footer"
    >
      Powered by MATH AI Platform — v{version}
    </footer>
  );
}
