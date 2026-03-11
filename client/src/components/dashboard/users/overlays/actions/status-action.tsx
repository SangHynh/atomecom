'use client';

import React from 'react';
import { Shield, CheckCircle2, Ban } from 'lucide-react';
import { USER_STATUS } from '@atomecom/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

interface StatusActionProps {
  status: USER_STATUS;
  isUpdating?: boolean;
  onStatusChange: (status: string) => void;
}

export function StatusAction({
  status,
  isUpdating,
  onStatusChange,
}: StatusActionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between p-3 gap-3">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="h-8 w-8 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
          <Shield className="h-4 w-4 text-amber-500" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wide text-foreground/80 truncate">
            {t('users.details.status', { defaultValue: 'Status' })}
          </div>
          <div className="text-[10px] text-muted-foreground/60 truncate">
            {t('users.details.status_hint', {
              defaultValue: 'Control account access',
            })}
          </div>
        </div>
      </div>
      <Select
        defaultValue={status}
        onValueChange={onStatusChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="h-8 w-[130px] shrink-0 text-[10px] font-bold uppercase tracking-wide border-border/10 rounded-md">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            value={USER_STATUS.ACTIVE}
            className="text-xs font-semibold"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-primary" />
              {t('users.table.status.active')}
            </span>
          </SelectItem>
          <SelectItem
            value={USER_STATUS.BANNED}
            className="text-xs font-semibold"
          >
            <span className="flex items-center gap-2">
              <Ban className="h-3 w-3 text-rose-500" />
              {t('users.table.status.banned')}
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
