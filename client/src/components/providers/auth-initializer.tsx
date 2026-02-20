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

  // Use refs so the async callback always sees current values
  // without causing the effect to re-run (which would re-trigger refresh)
  const isAuthenticatedRef = useRef(isAuthenticated);
  const logoutRef = useRef(logout);
  const tRef = useRef(t);
  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  // Only run once when the store has hydrated — NOT on every isAuthenticated change.
  // If isAuthenticated were in the dep array, HMR or store re-hydration could
  // re-trigger this effect, call refresh on an already-rotated token, get 401, and log out.
  useEffect(() => {
    if (!hasHydrated) return;
    if (initialized.current) return;
    initialized.current = true;

    const initializeAuth = async () => {
      const accessToken = getAccessToken();

      // If user just logged out intentionally, skip refresh cycle
      if (
        typeof window !== 'undefined' &&
        localStorage.getItem('explicitLogout') === 'true'
      ) {
        return;
      }

      if (!accessToken) {
        try {
          setIsRefreshing(true);
          const response = await AuthService.refreshToken();
          const newAccessToken = response.data.tokens.accessToken;
          setAccessToken(newAccessToken);
        } catch (error) {
          console.error('Silent refresh failed', error);
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            if (isAuthenticatedRef.current) {
              // DO NOT call logout() here again, just clear auth state
              // as it might re-trigger the route redirect in useAuth.
              setAccessToken(null);
              logoutRef.current();
              toast.error(tRef.current('auth.session_expired'));
            }
          }
          // Network/500 errors: do NOT logout, let interceptor handle next request
        } finally {
          setIsRefreshing(false);
        }
      }
    };

    initializeAuth();
  }, [hasHydrated]); // ✅ Only depends on hasHydrated

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
