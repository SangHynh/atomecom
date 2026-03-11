'use client';

import React from 'react';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';

interface PasswordActionProps {
  newPassword: string;
  setNewPassword: (pw: string) => void;
  isSavingPw: boolean;
  onReset: () => void;
}

export function PasswordAction({
  newPassword,
  setNewPassword,
  isSavingPw,
  onReset,
}: PasswordActionProps) {
  const { t } = useTranslation();

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-8 w-8 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
          <KeyRound className="h-4 w-4 text-blue-500" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-foreground/80">
            {t('users.details.reset_password', {
              defaultValue: 'Reset Password',
            })}
          </div>
          <div className="text-[10px] text-muted-foreground/60">
            {t('users.details.reset_password_hint', {
              defaultValue: 'Set a new password for this account',
            })}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          type="password"
          placeholder={t('users.form.password_placeholder')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="h-8 text-[10px] bg-background border-border/10 rounded-md flex-1"
        />
        <Button
          size="sm"
          onClick={onReset}
          disabled={!newPassword || newPassword.length < 8 || isSavingPw}
          className="h-8 px-3 rounded-md bg-primary text-background hover:bg-primary/90 font-bold text-[9px] uppercase tracking-wide shadow-none"
        >
          {isSavingPw ? '...' : t('common.save', { defaultValue: 'Save' })}
        </Button>
      </div>
    </div>
  );
}
