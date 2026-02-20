'use client';

import React from 'react';
import {
  Settings2,
  Shield,
  ShieldCheck,
  UserCog,
  KeyRound,
  Trash2,
  CheckCircle2,
  Ban,
} from 'lucide-react';
import { User, USER_ROLE, USER_STATUS } from '@atomecom/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

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
    if (!newPassword || newPassword.length < 6) {
      toast.error(
        t('users.actions.password_too_short', {
          defaultValue: 'Password must be at least 6 characters',
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
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Settings2 className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-widest text-foreground/80">
              {t('users.details.admin_actions', {
                defaultValue: 'Admin Actions',
              })}
            </h3>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.02] overflow-hidden divide-y divide-border/30">
            {/* Status */}
            <div className="flex items-center justify-between p-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
                    {t('users.details.status', {
                      defaultValue: 'Status',
                    })}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {t('users.details.status_hint', {
                      defaultValue: 'Control account access',
                    })}
                  </div>
                </div>
              </div>
              <Select
                defaultValue={user.status}
                onValueChange={handleStatusChange}
                disabled={isUpdating}
              >
                <SelectTrigger className="h-8 w-[150px] text-[10px] font-black uppercase tracking-wide border-border/50 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value={USER_STATUS.ACTIVE}
                    className="text-xs font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-blue-500" />
                      {t('users.table.status.active')}
                    </span>
                  </SelectItem>
                  <SelectItem
                    value={USER_STATUS.BANNED}
                    className="text-xs font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <Ban className="h-3 w-3 text-rose-500" />
                      {t('users.table.status.banned')}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Email Verified Toggle */}
            <div className="flex items-center justify-between p-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
                    {t('users.form.verified', {
                      defaultValue: 'Email Verified',
                    })}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {user.isVerified
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
                aria-checked={user.isVerified}
                onClick={handleToggleVerified}
                disabled={isUpdating}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none disabled:opacity-50',
                  user.isVerified ? 'bg-emerald-500' : 'bg-muted-foreground/30',
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform',
                    user.isVerified ? 'translate-x-4' : 'translate-x-0',
                  )}
                />
              </button>
            </div>

            {/* Role — Owner only */}
            {isOwner && (
              <div className="flex items-center justify-between p-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                    <UserCog className="h-4 w-4 text-rose-500" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
                      {t('users.form.role', { defaultValue: 'Role' })}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {t('users.details.role_hint', {
                        defaultValue: 'Assign permissions',
                      })}
                    </div>
                  </div>
                </div>
                <Select
                  defaultValue={user.role}
                  onValueChange={handleRoleChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="h-8 w-[150px] text-[10px] font-black uppercase tracking-wide border-border/50 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      value={USER_ROLE.USER}
                      className="text-xs font-bold"
                    >
                      {t('users.table.roles.user')}
                    </SelectItem>
                    <SelectItem
                      value={USER_ROLE.ADMIN}
                      className="text-xs font-bold"
                    >
                      {t('users.table.roles.admin')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Reset Password */}
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <KeyRound className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-foreground/80">
                    {t('users.details.reset_password', {
                      defaultValue: 'Reset Password',
                    })}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {t('users.details.reset_password_hint', {
                      defaultValue: 'Set a new password for this account',
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="New password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-8 text-xs bg-background border-border/60 rounded-lg flex-1"
                />
                <Button
                  size="sm"
                  onClick={handlePasswordReset}
                  disabled={
                    !newPassword || newPassword.length < 6 || isSavingPw
                  }
                  className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-[9px] uppercase tracking-widest"
                >
                  {isSavingPw
                    ? '...'
                    : t('common.save', { defaultValue: 'Save' })}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚨 Danger Zone */}
      {user.role !== USER_ROLE.OWNER && (
        <div className="pt-4 opacity-80 hover:opacity-100 transition-opacity">
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.02] p-4 space-y-3">
            <div className="flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest">
              <Shield className="h-3 w-3" />
              {t('users.details.danger_zone', {
                defaultValue: 'Danger Zone',
              })}
            </div>
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
                onClick={() => {
                  onDelete(user.id);
                }}
                className="h-8 px-3 rounded-lg border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all font-black text-[9px] uppercase tracking-widest active:scale-95 shrink-0 gap-1.5"
              >
                <Trash2 className="h-3 w-3" />
                {t('users.table.actions.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
