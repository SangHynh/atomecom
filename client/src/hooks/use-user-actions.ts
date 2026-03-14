'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { User, USER_STATUS, updateUserSchema } from '@atomecom/shared';

import { useConfirmation } from '@/components/dashboard/studio/studio-confirmation-provider';

interface UseUserActionsProps {
  user: User;
  onUpdate: (id: string, data: any) => Promise<any>;
}

export function useUserActions({
  user,
  onUpdate,
}: UseUserActionsProps) {
  const { t } = useTranslation();
  const { confirm } = useConfirmation();
  const [newPassword, setNewPassword] = React.useState('');
  const [isSavingPw, setIsSavingPw] = React.useState(false);

  const handleToggleVerified = () => {
    const willVerify = !user.isVerified;
    confirm({
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
      onConfirm: async () => {
        await onUpdate(user.id, { isVerified: willVerify });
      },
    });
  };

  const handleRoleChange = (role: string) => {
    confirm({
      title: t('users.details.change_role_title', {
        defaultValue: 'Change Role',
      }),
      description: t('users.details.confirm_role_change', {
        defaultValue: 'Change this user role to {{role}}?',
        role: t(`users.table.roles.${role.toLowerCase()}`),
      }),
      variant: 'warning',
      onConfirm: async () => {
        await onUpdate(user.id, { role });
      },
    });
  };

  const handleStatusChange = (status: string) => {
    confirm({
      title: t('users.page.status_confirm', {
        defaultValue: 'Confirm Status Change',
      }),
      description: t('users.page.status_confirm_text', {
        defaultValue: 'Change status to {{status}}?',
        status: t(`users.table.status.${status.toLowerCase()}`),
      }),
      variant: status === USER_STATUS.BANNED ? 'ban' : 'primary',
      onConfirm: async () => {
        await onUpdate(user.id, { status });
      },
    });
  };

  const handlePasswordReset = () => {
    const result = updateUserSchema.safeParse({ password: newPassword });

    if (!result.success) {
      const error = result.error.errors[0];
      toast.error(
        t(`errors.${error.message}`, {
          ns: 'errors',
          defaultValue: error.message,
        }),
      );
      return;
    }
    confirm({
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

  return {
    newPassword,
    setNewPassword,
    isSavingPw,
    handleToggleVerified,
    handleRoleChange,
    handleStatusChange,
    handlePasswordReset,
  };
}
