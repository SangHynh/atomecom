'use client';

import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import '@/lib/i18n'; // Import our configured i18n
import i18n from '@/lib/i18n';

export default function I18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR, we still want to render children
  // i18n is already initialized in lib/i18n.ts (guarded for SSR)

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
