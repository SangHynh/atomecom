'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { USER_ROLE } from '@atomecom/shared';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: USER_ROLE[];
  requireVerified?: boolean;
}

export default function AuthGuard({
  children,
  allowedRoles,
  requireVerified,
}: AuthGuardProps) {
  const { user, isAuthenticated, hasHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/'); // Unauthorized
      }

      // Uncomment if verification check is needed strictly here
      // if (requireVerified && !user.isVerified) {
      //    router.push('/verify-email');
      // }
    }
  }, [
    isAuthenticated,
    user,
    router,
    allowedRoles,
    requireVerified,
    hasHydrated,
  ]);

  if (!hasHydrated || (!isAuthenticated && !user)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
