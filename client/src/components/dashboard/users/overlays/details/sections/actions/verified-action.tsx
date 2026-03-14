'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface VerifiedActionProps {
  isVerified: boolean;
  isUpdating?: boolean;
  onToggle: () => void;
}

export function VerifiedAction({
  isVerified,
  isUpdating,
  onToggle,
}: VerifiedActionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between p-3 gap-3">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="h-8 w-8 rounded-[var(--radius)] bg-primary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wide text-foreground/80 truncate">
            {t('users.form.verified', {
              defaultValue: 'Email Verified',
            })}
          </div>
          <div className="text-[10px] text-muted-foreground/60 truncate">
            {isVerified
              ? t('users.details.is_verified', {
                  defaultValue: 'Email is verified',
                })
              : t('users.details.not_verified', {
                  defaultValue: 'Not yet verified',
                })}
          </div>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isVerified}
        onClick={onToggle}
        disabled={isUpdating}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none disabled:opacity-50',
          isVerified ? 'bg-primary' : 'bg-muted-foreground/30',
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-none ring-0 transition-transform',
            isVerified ? 'translate-x-4' : 'translate-x-0',
          )}
        />
      </button>
    </div>
  );
}





