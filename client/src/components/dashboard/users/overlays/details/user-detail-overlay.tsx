'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, USER_ROLE, USER_STATUS } from '@atomecom/shared';
import {
  X,
  User as UserIcon,
  ShieldCheck,
  Mail,
  Phone,
  Trash2,
  Lock,
  Edit,
  Type,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { UserForm } from '../form/user-form';
import { StudioOverlay } from '@/components/dashboard/studio/studio-overlay';
import { UserDetailActions } from './sections/user-detail-actions';
import { UserDetailContact } from './sections/user-detail-contact';
import { UserDetailSecurity } from './sections/user-detail-security';
import { useAuth } from '@/hooks/use-auth';

interface UserDetailOverlayProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: any) => Promise<any>;
  isUpdating?: boolean;
}

export function UserDetailOverlay({
  user,
  isOpen,
  onClose,
  onDelete,
  onUpdate,
  isUpdating,
}: UserDetailOverlayProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const { user: currentUser } = useAuth();

  if (!user) return null;

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  const leftContent = (
    <div className="flex flex-col h-full w-full">
      {/* Profile Hero */}
      <div className="p-8 flex flex-col items-center text-center border-b border-border/40 bg-muted/5">
        <Avatar className="h-24 w-24 border-4 border-background shadow-xl mb-4 group-hover:scale-105 transition-transform duration-500">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-3xl font-black bg-foreground/5 text-foreground/40">
            {user.name?.charAt(0) || user.email.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <h2 className="text-xl font-black uppercase tracking-tighter leading-none">
            {user.name}
          </h2>
          <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-widest">
            {user.id.slice(0, 12)}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <span
            className={cn(
              'px-2.5 py-0.5 rounded-none text-[9px] font-black uppercase tracking-[0.15em] border',
              user.role === USER_ROLE.ADMIN || user.role === USER_ROLE.OWNER
                ? 'bg-foreground text-background border-transparent'
                : 'bg-transparent text-foreground border-border/40',
            )}
          >
            {user.role}
          </span>
          <span
            className={cn(
              'px-2.5 py-0.5 rounded-none text-[9px] font-black uppercase tracking-[0.15em] border',
              user.status === USER_STATUS.ACTIVE
                ? 'bg-success/10 text-success border-success/20'
                : 'bg-muted/10 text-muted-foreground border-border/20',
            )}
          >
            {user.status}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <UserDetailActions
          user={user}
          currentUser={currentUser}
          isUpdating={isUpdating}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      </div>
    </div>
  );

  const rightContent = (
    <div className="p-8 md:p-10 space-y-12">
      {isEditing ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary italic">
              // Cập nhật giao thức người dùng
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="text-[10px] font-black uppercase tracking-widest"
            >
              Hủy bỏ
            </Button>
          </div>
          <UserForm
            user={user}
            isLoading={isUpdating}
            onSubmit={async (data) => {
              await onUpdate(user.id, data);
              setIsEditing(false);
            }}
          />
        </div>
      ) : (
        <div className="animate-in fade-in duration-700 space-y-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">
                Thông tin định danh chi tiết
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-8 rounded-none border-border/40 font-black uppercase tracking-widest text-[9px] gap-2 px-4 hover:bg-foreground hover:text-background transition-all"
            >
              <Edit className="h-3 w-3" />
              Chỉnh sửa
            </Button>
          </div>

          <div className="space-y-12">
            <UserDetailContact user={user} currentUser={currentUser} />
            <UserDetailSecurity user={user} />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <StudioOverlay
      isOpen={isOpen}
      onClose={handleClose}
      leftContent={leftContent}
      rightContent={rightContent}
      maxWidth="max-w-6xl"
      sidePanelWidth="md:w-[320px] lg:w-[380px]"
    />
  );
}





