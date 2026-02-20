'use client';

import React, { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { AuthService } from '@/services/auth.service';
import { setAccessToken, getAccessToken } from '@/lib/axios';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, logout, hasHydrated } = useStore();
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      if (!hasHydrated) return;
      if (initialized.current) return;
      initialized.current = true;

      const accessToken = getAccessToken();

      if (!accessToken) {
        try {
          setIsRefreshing(true);
          const response = await AuthService.refreshToken();
          const newAccessToken = response.data.tokens.accessToken;
          setAccessToken(newAccessToken);
        } catch (error) {
          console.error('Silent refresh failed', error);
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            if (isAuthenticated) {
              logout();
              setAccessToken(null);
              // Session expiry is a business-logic event — show toast
              toast.error(t('auth.session_expired'));
            }
          }
          // Network/500 errors: do NOT logout, let interceptor handle next request
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    initializeAuth();
  }, [isAuthenticated, logout, hasHydrated, t]);

  if (isRefreshing || !hasHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">
            {t('auth.initializing')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
