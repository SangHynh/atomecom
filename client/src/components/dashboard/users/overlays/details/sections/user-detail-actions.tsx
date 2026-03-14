'use client';

import React from 'react';
import { Settings2 } from 'lucide-react';
import { User, USER_ROLE, USER_STATUS, ErrorUserCodes, updateUserSchema } from '@atomecom/shared';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Sub-components
import { StatusAction } from './actions/status-action';
import { VerifiedAction } from './actions/verified-action';
import { RoleAction } from './actions/role-action';
import { PasswordAction } from './actions/password-action';
import { DangerZone } from './actions/danger-zone';
import { canManageUser } from '@/lib/user-permissions';
import { useUserActions } from '@/hooks/use-user-actions';

interface UserDetailActionsProps {
  user: User;
  currentUser: User | null;
  isUpdating?: boolean;
  onUpdate: (id: string, data: any) => Promise<any>;
  onDelete: (id: string) => void;
}

export function UserDetailActions({
  user,
  currentUser,
  isUpdating,
  onUpdate,
  onDelete,
}: UserDetailActionsProps) {
  const { t } = useTranslation();
  const {
    newPassword,
    setNewPassword,
    isSavingPw,
    handleToggleVerified,
    handleRoleChange,
    handleStatusChange,
    handlePasswordReset,
  } = useUserActions({ user, onUpdate });

  const isOwner = currentUser?.role === USER_ROLE.OWNER;
  const canAdminActions = canManageUser(currentUser, user);

  // Don't render for self
  if (user.id === currentUser?.id) return null;

  return (
    <div className="px-2 space-y-6">
      {/* ⚙️ Admin Actions */}
      {canAdminActions && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-warning/40 to-transparent" />
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40 shrink-0 flex items-center gap-1.5">
              <Settings2 className="h-3 w-3 text-warning/60" />
              {t('users.details.admin_actions', {
                defaultValue: 'Admin Actions',
              })}
            </h3>
            <div className="h-px flex-1 bg-gradient-l from-warning/40 to-transparent" />
          </div>

          <div className="rounded-[var(--radius)] border border-warning/20 bg-warning/[0.02] overflow-hidden divide-y divide-border/30">
            <StatusAction
              status={user.status}
              isUpdating={isUpdating}
              onStatusChange={handleStatusChange}
            />

            <VerifiedAction
              isVerified={user.isVerified}
              isUpdating={isUpdating}
              onToggle={handleToggleVerified}
            />

            {isOwner && (
              <RoleAction
                role={user.role}
                isUpdating={isUpdating}
                onRoleChange={handleRoleChange}
              />
            )}

            <PasswordAction
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              isSavingPw={isSavingPw}
              onReset={handlePasswordReset}
            />
          </div>
        </div>
      )}

      {/* 🚨 Danger Zone */}
      {user.role !== USER_ROLE.OWNER && (
        <DangerZone onDelete={() => onDelete(user.id)} />
      )}
    </div>
  );
}





