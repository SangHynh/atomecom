'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { AuthService } from '@/services/auth.service';
import { setAccessToken, getAccessToken } from '@/lib/axios';
import { toast } from 'sonner';

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, logout, setUser } = useStore();
  const initialized = useRef(false);

  useEffect(() => {
    const initializeAuth = async () => {
      // Prevent double cleanup/init in strict mode
      if (initialized.current) return;
      initialized.current = true;

      const accessToken = getAccessToken();

      // If we think we are authenticated but have no access token (e.g. reload)
      if (isAuthenticated && !accessToken) {
        try {
          // Attempt silent refresh
          const response = await AuthService.refreshToken();
          const newAccessToken = response.data.tokens.accessToken;
          setAccessToken(newAccessToken);

          // Optionally sync user data if needed, but store should have it.
          // If the backend returns user data on refresh, update it:
          // setUser(response.user);
        } catch (error) {
          // If refresh fails (cookie expired/invalid), logout client
          console.error('Silent refresh failed', error);
          logout();
          setAccessToken(null);
          toast.error('Session expired. Please login again.');
        }
      }
    };

    initializeAuth();
  }, [isAuthenticated, logout]);

  return <>{children}</>;
}
