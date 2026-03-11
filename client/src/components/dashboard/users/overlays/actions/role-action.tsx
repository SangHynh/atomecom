'use client';

import React from 'react';
import { UserCog } from 'lucide-react';
import { USER_ROLE } from '@atomecom/shared';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

interface RoleActionProps {
  role: USER_ROLE;
  isUpdating?: boolean;
  onRoleChange: (role: string) => void;
}

export function RoleAction({
  role,
  isUpdating,
  onRoleChange,
}: RoleActionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between p-3 gap-3">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="h-8 w-8 rounded-md bg-rose-500/10 flex items-center justify-center shrink-0">
          <UserCog className="h-4 w-4 text-rose-500" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-wide text-foreground/80 truncate">
            {t('users.form.role', { defaultValue: 'Role' })}
          </div>
          <div className="text-[10px] text-muted-foreground/60 truncate">
            {t('users.details.role_hint', {
              defaultValue: 'Assign permissions',
            })}
          </div>
        </div>
      </div>
      <Select
        defaultValue={role}
        onValueChange={onRoleChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="h-8 w-[130px] shrink-0 text-[10px] font-bold uppercase tracking-wide border-border/10 rounded-md">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={USER_ROLE.USER} className="text-xs font-semibold">
            {t('users.table.roles.user')}
          </SelectItem>
          <SelectItem value={USER_ROLE.ADMIN} className="text-xs font-semibold">
            {t('users.table.roles.admin')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
