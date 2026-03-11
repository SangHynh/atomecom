'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface DangerZoneProps {
  onDelete: () => void;
}

export function DangerZone({ onDelete }: DangerZoneProps) {
  const { t } = useTranslation();

  return (
    <div className="pt-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-px flex-1 bg-gradient-to-r from-rose-500/40 to-transparent" />
        <h3 className="text-[9px] font-bold uppercase tracking-wider text-rose-500/40 shrink-0">
          {t('users.details.danger_zone', { defaultValue: 'Danger Zone' })}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-l from-rose-500/40 to-transparent" />
      </div>
      <div className="rounded-sm border border-rose-500/20 bg-rose-500/[0.02] hover:bg-rose-500/[0.04] transition-all p-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-foreground">
              {t('users.details.delete_title', {
                defaultValue: 'Delete Account',
              })}
            </p>
            <p className="text-[9px] text-muted-foreground leading-tight">
              {t('users.details.delete_warning', {
                defaultValue:
                  'Once deleted, this user will be restricted and their data will be masked.',
              })}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onDelete}
            className="h-8 px-3 rounded-md border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all font-bold text-[9px] uppercase tracking-wide active:scale-95 shrink-0 gap-1.5 shadow-none"
          >
            <Trash2 className="h-3 w-3" />
            {t('users.table.actions.delete')}
          </Button>
        </div>
      </div>
    </div>
  );
}
