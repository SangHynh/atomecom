'use client';

import { ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SocialAuthButtons } from '@/components/auth/social-auth-buttons';
import { useTranslation } from 'react-i18next';

interface AuthPageShellProps {
  /** Card title */
  title: string;
  /** Card subtitle/description */
  description: string;
  /** Label for the OR-divider between social and email form */
  dividerLabel: string;
  /** Whether auth action is loading (disables social buttons) */
  isLoading?: boolean;
  /** Link rendered below the form */
  footer: ReactNode;
  children: ReactNode;
}

/**
 * Shared shell for Login and Register pages.
 * Handles centering, card, social buttons, OR-divider, and footer link.
 */
export function AuthPageShell({
  title,
  description,
  dividerLabel,
  isLoading,
  footer,
  children,
}: AuthPageShellProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/50 rounded-3xl overflow-hidden bg-background/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 pb-8">
          <CardTitle className="text-3xl font-black text-center tracking-tight">
            {title}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground font-medium">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SocialAuthButtons isLoading={isLoading ?? false} />

          {/* OR divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-tighter">
              <span className="bg-background px-4 text-muted-foreground font-bold">
                {dividerLabel}
              </span>
            </div>
          </div>

          {children}

          <div className="pt-2 text-center text-sm">{footer}</div>
        </CardContent>
      </Card>
    </div>
  );
}
