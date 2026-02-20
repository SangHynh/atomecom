'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthService } from '@/services/auth.service';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { USER_ROLE, ErrorAuthCodes } from '@atomecom/shared';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { t } = useTranslation();

  // Ref to prevent double execution in Strict Mode
  const verifyCalled = React.useRef(false);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  );
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(
        t('auth.verify_email.no_token', 'No verification token provided.'),
      );
      return;
    }

    // Prevent double execution
    if (verifyCalled.current) return;
    verifyCalled.current = true;

    const verify = async () => {
      // Minimum delay 2s for UX
      const minDelay = new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        const [response] = (await Promise.all([
          AuthService.verifyEmail(token),
          minDelay,
        ])) as [any, any];

        setStatus('success');
        setMessage(
          t('auth.verify_email.success', 'Email verified successfully!'),
        );

        const user = response.data?.user;

        setTimeout(() => {
          if (
            user?.role === USER_ROLE.ADMIN ||
            user?.role === USER_ROLE.OWNER
          ) {
            router.push('/admin');
          } else {
            router.push('/');
          }
        }, 1500);
      } catch (error: any) {
        // Handle "Already Verified" as success
        const errorCode = error.response?.data?.message;

        if (errorCode === ErrorAuthCodes.EMAIL_VERIFICATION_LINK_ALREADY_USED) {
          await minDelay; // Ensure delay finishes even on error
          setStatus('success');
          setMessage(
            t(
              'auth.verify_email.already_verified',
              'Email already verified. Redirecting...',
            ),
          );
          setTimeout(() => {
            router.push('/login');
          }, 2000);
          return;
        }

        setStatus('error');
        setMessage(
          error.response?.data?.message ||
            t(
              'auth.verify_email.failed',
              'Verification failed. The link may be invalid or expired.',
            ),
        );
      }
    };

    verify();
  }, [token, router, t]);

  return (
    <Card className="w-full max-w-md shadow-2xl border-border/50 rounded-3xl overflow-hidden bg-background/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
          {status === 'loading' && (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          )}
          {status === 'success' && (
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          )}
          {status === 'error' && <XCircle className="h-8 w-8 text-rose-500" />}
        </div>
        <CardTitle className="text-2xl font-black tracking-tight">
          {status === 'loading' &&
            t('auth.verify_email.verifying', 'Verifying...')}
          {status === 'success' &&
            t('auth.verify_email.verified', 'Email Verified')}
          {status === 'error' &&
            t('auth.verify_email.error', 'Verification Failed')}
        </CardTitle>
        <CardDescription className="font-medium">
          {message ||
            (status === 'loading'
              ? t(
                  'auth.verify_email.please_wait',
                  'Please wait while we verify your email address.',
                )
              : '')}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        {status === 'success' && (
          <p className="text-sm text-muted-foreground animate-pulse">
            {t(
              'auth.verify_email.redirecting',
              'Redirecting you to the dashboard...',
            )}
          </p>
        )}
      </CardContent>

      <CardFooter className="flex justify-center pb-8">
        {status === 'error' && (
          <div className="flex flex-col gap-3 w-full">
            <Button asChild variant="outline" className="w-full rounded-xl">
              <Link href="/login">
                {t('auth.back_to_login', 'Back to Login')}
              </Link>
            </Button>
          </div>
        )}
        {status === 'success' && (
          <Button
            asChild
            className="w-full rounded-xl shadow-lg shadow-primary/20"
          >
            <Link href="/login">
              {t('auth.continue', 'Continue')}{' '}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Suspense
        fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
