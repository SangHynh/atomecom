'use client';

import React from 'react';
import { Settings2 } from 'lucide-react';
import { User, USER_ROLE, USER_STATUS, ErrorUserCodes } from '@atomecom/shared';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// Sub-components
import { StatusAction } from './actions/status-action';
import { VerifiedAction } from './actions/verified-action';
import { RoleAction } from './actions/role-action';
import { PasswordAction } from './actions/password-action';
import { DangerZone } from './actions/danger-zone';

interface UserDetailActionsProps {
  user: User;
  currentUser: User | null;
  isUpdating?: boolean;
  onUpdate: (id: string, data: any) => Promise<any>;
  onDelete: (id: string) => void;
  onRequestConfirm: (config: {
    title: string;
    description: string;
    variant: 'danger' | 'warning' | 'info' | 'primary' | 'ban';
    onConfirm: () => void;
  }) => void;
}

export function UserDetailActions({
  user,
  currentUser,
  isUpdating,
  onUpdate,
  onDelete,
  onRequestConfirm,
}: UserDetailActionsProps) {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = React.useState('');
  const [isSavingPw, setIsSavingPw] = React.useState(false);

  const isOwner = currentUser?.role === USER_ROLE.OWNER;
  const isAdmin = currentUser?.role === USER_ROLE.ADMIN;

  const canAdminActions = React.useMemo(() => {
    if (!currentUser) return false;
    if (isOwner) return true;
    if (isAdmin && user.role === USER_ROLE.USER) return true;
    return false;
  }, [currentUser, user, isOwner, isAdmin]);

  // Don't render for self
  if (user.id === currentUser?.id) return null;

  const handleToggleVerified = () => {
    const willVerify = !user.isVerified;
    onRequestConfirm({
      title: willVerify
        ? t('users.actions.verified_success', {
            defaultValue: 'Mark as Verified',
          })
        : t('users.actions.unverified_success', {
            defaultValue: 'Mark as Unverified',
          }),
      description: willVerify
        ? t('users.details.confirm_verify', {
            defaultValue: 'Mark this user as verified?',
          })
        : t('users.details.confirm_unverify', {
            defaultValue: 'Remove verification from this user?',
          }),
      variant: willVerify ? 'primary' : 'warning',
      onConfirm: () => onUpdate(user.id, { isVerified: willVerify }),
    });
  };

  const handleRoleChange = (role: string) => {
    onRequestConfirm({
      title: t('users.details.change_role_title', {
        defaultValue: 'Change Role',
      }),
      description: t('users.details.confirm_role_change', {
        defaultValue: 'Change this user role to {{role}}?',
        role: t(`users.table.roles.${role.toLowerCase()}`),
      }),
      variant: 'warning',
      onConfirm: () => onUpdate(user.id, { role }),
    });
  };

  const handleStatusChange = (status: string) => {
    onRequestConfirm({
      title: t('users.page.status_confirm', {
        defaultValue: 'Confirm Status Change',
      }),
      description: t('users.page.status_confirm_text', {
        defaultValue: 'Change status to {{status}}?',
        status: t(`users.table.status.${status.toLowerCase()}`),
      }),
      variant: status === USER_STATUS.BANNED ? 'ban' : 'primary',
      onConfirm: () => onUpdate(user.id, { status }),
    });
  };

  const handlePasswordReset = () => {
    const isValid =
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      /[^a-zA-Z0-9]/.test(newPassword);

    if (!newPassword || !isValid) {
      toast.error(
        t(`errors.${ErrorUserCodes.PASSWORD_TOO_SHORT}`, {
          ns: 'errors',
          defaultValue: 'Must be 8+ chars, 1 upper, 1 number, 1 special',
        }),
      );
      return;
    }
    onRequestConfirm({
      title: t('users.details.admin_actions.password_reset', {
        defaultValue: 'Reset Password',
      }),
      description: t('users.details.confirm_password_reset', {
        defaultValue: 'Reset the password for this user?',
      }),
      variant: 'warning',
      onConfirm: async () => {
        setIsSavingPw(true);
        try {
          await onUpdate(user.id, { password: newPassword });
          setNewPassword('');
        } finally {
          setIsSavingPw(false);
        }
      },
    });
  };

  return (
    <div className="px-2 space-y-6">
      {/* ⚙️ Admin Actions */}
      {canAdminActions && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
            <h3 className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40 shrink-0 flex items-center gap-1.5">
              <Settings2 className="h-3 w-3 text-amber-500/60" />
              {t('users.details.admin_actions', {
                defaultValue: 'Admin Actions',
              })}
            </h3>
            <div className="h-px flex-1 bg-gradient-l from-amber-500/40 to-transparent" />
          </div>

          <div className="rounded-sm border border-amber-500/20 bg-amber-500/[0.02] overflow-hidden divide-y divide-border/30">
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
