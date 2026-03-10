'use client';

import React from 'react';
import { ShieldCheck, User as UserIcon } from 'lucide-react';
import { User, USER_ROLE } from '@atomecom/shared';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';

import { UserDetailContact } from './user-detail-contact';
import { UserDetailSecurity } from './user-detail-security';
import { UserDetailActions } from './user-detail-actions';

interface UserDetailSheetProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: any) => Promise<any>;
  isUpdating?: boolean;
  onRequestConfirm: (config: {
    title: string;
    description: string;
    variant: 'danger' | 'warning' | 'info' | 'primary' | 'ban';
    onConfirm: () => void;
  }) => void;
}

export function UserDetailSheet({
  user,
  isOpen,
  onClose,
  onDelete,
  onUpdate,
  isUpdating,
  onRequestConfirm,
}: UserDetailSheetProps) {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="fixed right-0 top-0 bottom-0 h-full w-full sm:max-w-[500px] rounded-none border-l border-border/40 shadow-2xl backdrop-blur-xl bg-background/97 flex flex-col gap-0 p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right duration-400 ease-out translate-x-0 translate-y-0 left-auto top-0 overflow-hidden">
        {/* Header strip */}
        <DialogHeader className="shrink-0 border-b border-border/30 px-4 sm:px-6 py-3 flex-row items-center gap-2 bg-background/80 backdrop-blur-md">
          <DialogTitle className="text-[15px] font-black tracking-widest uppercase text-foreground/90 flex items-center gap-2 flex-1">
            <UserIcon className="h-4 w-4 text-primary" />
            {t('users.details.profile')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Hero Section with gradient banner */}
          <div className="relative">
            {/* Gradient mesh banner */}
            <div
              className={cn(
                'h-24 sm:h-28 w-full relative overflow-hidden',
                user.role === USER_ROLE.OWNER
                  ? 'bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-transparent'
                  : user.role === USER_ROLE.ADMIN
                    ? 'bg-gradient-to-br from-amber-500/20 via-orange-400/10 to-transparent'
                    : 'bg-gradient-to-br from-blue-600/20 via-indigo-500/10 to-transparent',
              )}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-from),_transparent_70%)] from-white/5" />
            </div>

            {/* Avatar overlapping the banner */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 sm:-bottom-12">
              <div className="relative">
                <div
                  className={cn(
                    'absolute inset-0 rounded-full blur-md opacity-40 scale-110',
                    user.role === USER_ROLE.OWNER
                      ? 'bg-rose-500'
                      : user.role === USER_ROLE.ADMIN
                        ? 'bg-amber-500'
                        : 'bg-blue-600',
                  )}
                />
                <Avatar
                  className={cn(
                    'h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-2xl relative',
                  )}
                >
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback
                    className={cn(
                      'text-2xl sm:text-3xl font-black uppercase',
                      user.role === USER_ROLE.OWNER
                        ? 'bg-rose-500/20 text-rose-500'
                        : user.role === USER_ROLE.ADMIN
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-blue-600/10 text-blue-600',
                    )}
                  >
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={cn(
                    'absolute bottom-1 right-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border-4 border-background',
                    user.isOnline
                      ? 'bg-primary'
                      : 'bg-zinc-300 dark:bg-zinc-600',
                  )}
                >
                  {user.isOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Name + badges — offset by avatar height */}
          <div className="mt-12 sm:mt-14 px-4 sm:px-6 pb-4 flex flex-col items-center gap-2 text-center">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tighter line-clamp-1">
              {user.name}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <Badge
                className={cn(
                  'rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest border-none shadow-sm',
                  user.role === USER_ROLE.OWNER
                    ? 'bg-rose-500/15 text-rose-500'
                    : user.role === USER_ROLE.ADMIN
                      ? 'bg-amber-500/15 text-amber-500'
                      : 'bg-blue-600/15 text-blue-600',
                )}
              >
                {t(`users.table.roles.${user.role.toLowerCase()}`)}
              </Badge>
              <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              <Badge
                variant="outline"
                className={cn(
                  'rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest shadow-sm',
                  user.status === 'ACTIVE'
                    ? 'bg-primary/10 text-primary border-primary/20'
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                )}
              >
                {t(`users.table.status.${user.status.toLowerCase()}`)}
              </Badge>
              {user.isVerified && (
                <Badge className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest border-none bg-primary/10 text-primary shadow-sm">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {t('users.table.verification.verified', {
                    defaultValue: 'Verified',
                  })}
                </Badge>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 sm:mx-6 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent mb-4" />

          <div className="space-y-6 px-4 sm:px-6 pb-6">
            <UserDetailContact user={user} currentUser={currentUser} />

            <UserDetailSecurity user={user} />

            <UserDetailActions
              user={user}
              currentUser={currentUser}
              isUpdating={isUpdating}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onRequestConfirm={onRequestConfirm}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
