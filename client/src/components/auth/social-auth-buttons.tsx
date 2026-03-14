'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { ClientErrorCodes } from '@atomecom/shared';
import { useTranslation } from 'react-i18next';
import logger from '@/lib/logger';

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface SocialAuthButtonsProps {
  isLoading: boolean;
}

export function SocialAuthButtons({ isLoading }: SocialAuthButtonsProps) {
  const { socialLogin, isSocialLoggingIn } = useAuth();
  const { t } = useTranslation();
  const [tokenClient, setTokenClient] = useState<any>(null); // Keep any for external SDK client for now

  const initializeGoogle = () => {
    if (tokenClient) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      logger.warn('[SocialAuth] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set');
      return;
    }
    if (window.google?.accounts?.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope:
          'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: (response: TokenResponse) => {
          if (response.error) {
            // User-facing: OAuth flow actually errored (business logic)
            toast.error(t(`errors.${ClientErrorCodes.SOCIAL_LOGIN_FAILED}`));
            return;
          }
          socialLogin({ provider: 'google', token: response.access_token });
        },
      });
      setTokenClient(client);
    }
  };

  const initializeFacebook = () => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!appId) return;
    if (window.FB) {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: 'v18.0',
      });
    }
  };

  useEffect(() => {
    if (window.google) {
      initializeGoogle();
    }
    window.fbAsyncInit = function () {
      initializeFacebook();
    };
  }, [socialLogin, tokenClient]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGoogleLogin = () => {
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      // Missing env var — infra issue, not user-facing
      logger.warn(
        '[SocialAuth] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured',
      );
      return;
    }
    if (tokenClient) {
      tokenClient.requestAccessToken();
    } else {
      // SDK not ready yet — retry init silently
      initializeGoogle();
      logger.warn('[SocialAuth] Google SDK not ready, retrying init...');
    }
  };

  const handleFacebookLogin = () => {
    if (!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID) {
      logger.warn(
        '[SocialAuth] NEXT_PUBLIC_FACEBOOK_APP_ID is not configured',
      );
      return;
    }
    if (!window.FB) {
      logger.warn('[SocialAuth] Facebook SDK not loaded');
      return;
    }
    window.FB.login(
      (response: any) => {
        if (response.authResponse) {
          socialLogin({
            provider: 'facebook',
            token: response.authResponse.accessToken,
          });
        } else {
          // User cancelled or denied — user-facing feedback is appropriate
          toast.error(t(`errors.${ClientErrorCodes.SOCIAL_LOGIN_FAILED}`));
        }
      },
      { scope: 'public_profile,email' },
    );
  };

  return (
    <div className="space-y-4">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGoogle}
      />

      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        strategy="afterInteractive"
        onLoad={initializeFacebook}
      />

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          type="button"
          className="h-11 rounded-[var(--radius)] border-border/60 hover:bg-muted/50 font-bold tracking-tight transition-all active:scale-95"
          onClick={handleGoogleLogin}
          disabled={isLoading || isSocialLoggingIn}
        >
          {isSocialLoggingIn ? (
            <span className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2" />
          ) : (
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="#4285F4"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          )}
          Google
        </Button>
        <Button
          variant="outline"
          type="button"
          className="h-11 rounded-[var(--radius)] border-border/60 hover:bg-muted/50 font-bold tracking-tight transition-all active:scale-95"
          onClick={handleFacebookLogin}
          disabled={isLoading || isSocialLoggingIn}
        >
          <svg className="h-4 w-4 mr-2" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </Button>
      </div>
    </div>
  );
}
