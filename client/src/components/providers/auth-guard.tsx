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
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
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
  }, [isAuthenticated, user, router, allowedRoles, requireVerified]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
