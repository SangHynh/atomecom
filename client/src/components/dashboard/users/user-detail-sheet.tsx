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
      <DialogContent className="fixed right-0 top-0 bottom-0 h-full w-full sm:max-w-[500px] rounded-none border-l border-border/50 shadow-2xl backdrop-blur-xl bg-background/95 transition-all duration-300 translate-x-0 translate-y-0 left-auto top-0 flex flex-col gap-0 p-6">
        <DialogHeader className="border-b border-border/50 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl font-black tracking-tighter uppercase flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-blue-600" />
              {t('users.details.profile')}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-8 py-4">
          {/* Hero Section */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-blue-600/20 ring-4 ring-background shadow-2xl">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-3xl font-black bg-blue-600/10 text-blue-600 uppercase">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  'absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border-4 border-background',
                  user.isOnline
                    ? 'bg-emerald-500'
                    : 'bg-zinc-300 dark:bg-zinc-600',
                )}
              >
                {user.isOnline && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
              </span>
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tighter">
                {user.name}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <Badge
                  className={cn(
                    'rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border-none',
                    user.role === USER_ROLE.OWNER
                      ? 'bg-rose-500/10 text-rose-500'
                      : user.role === USER_ROLE.ADMIN
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'bg-blue-600/10 text-blue-600',
                  )}
                >
                  {t(`users.table.roles.${user.role.toLowerCase()}`)}
                </Badge>
                <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <Badge
                  variant="outline"
                  className={cn(
                    'rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest',
                    user.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20',
                  )}
                >
                  {t(`users.table.status.${user.status.toLowerCase()}`)}
                </Badge>
                {user.isVerified && (
                  <Badge className="rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border-none bg-emerald-500/10 text-emerald-600">
                    <ShieldCheck className="h-2.5 w-2.5 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

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
      </DialogContent>
    </Dialog>
  );
}
