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

interface UserDetailSheetProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: any) => Promise<any>;
  isUpdating?: boolean;
}

export function UserDetailSheet({
  user,
  isOpen,
  onClose,
  onDelete,
  onUpdate,
  isUpdating,
}: UserDetailSheetProps) {
  const [isEditing, setIsEditing] = React.useState(false);

  if (!user) return null;

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 lg:p-12 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-background/40 backdrop-blur-[24px] cursor-zoom-out"
          />

          {/* Centered Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 30 }}
            className="relative w-full h-full md:h-auto md:max-h-[85vh] max-w-2xl bg-background border-[0.5px] border-border/40 rounded-none md:rounded-md shadow-2xl overflow-hidden flex flex-col z-50"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between shrink-0 bg-background/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                  <UserIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground leading-none">
                    {isEditing ? 'Cập nhật người dùng' : 'Hồ sơ người dùng'}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                    ID:{' '}
                    <span className="font-mono">
                      {user.id.slice(0, 8).toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-9 px-4 rounded-md border-border/60 font-bold uppercase tracking-wider text-[10px] gap-2"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Chỉnh sửa
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="h-9 w-9 rounded-md hover:bg-muted/10 border border-border/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isEditing ? (
                <UserForm
                  user={user}
                  isLoading={isUpdating}
                  onSubmit={async (data) => {
                    await onUpdate(user.id, data);
                    setIsEditing(false);
                  }}
                />
              ) : (
                <div className="px-6 py-8 space-y-10">
                  {/* Profile Hero */}
                  <div className="flex items-center gap-6 p-6 rounded-md border border-border/40 bg-muted/10">
                    <Avatar className="h-20 w-20 border-2 border-background shadow-none">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                        {user.name?.charAt(0) || user.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1.5">
                      <h2 className="text-2xl font-bold leading-none">
                        {user.name}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        {user.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </span>
                        )}
                      </div>
                      <div className="pt-2 flex gap-2">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide',
                            user.role === USER_ROLE.ADMIN
                              ? 'bg-amber-50 text-amber-600 border border-amber-100'
                              : 'bg-primary/5 text-primary border border-primary/10',
                          )}
                        >
                          {user.role}
                        </span>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide',
                            user.status === USER_STATUS.ACTIVE
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-zinc-50 text-zinc-500 border border-zinc-100',
                          )}
                        >
                          {user.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <section className="space-y-6">
                    <div className="flex items-center gap-2 text-primary opacity-60">
                      <ShieldCheck className="h-4 w-4" />
                      <h3 className="text-[10px] font-bold uppercase tracking-widest">
                        Cài đặt bảo mật
                      </h3>
                    </div>
                    <div className="pl-6.5 grid grid-cols-2 gap-8">
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">
                          Quyền truy cập
                        </label>
                        <p className="text-sm font-medium mt-1 uppercase text-primary tracking-wider">
                          {user.role}
                        </p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">
                          Loại tài khoản
                        </label>
                        <p className="text-sm font-medium mt-1">
                          Hệ thống cục bộ
                        </p>
                      </div>
                    </div>
                  </section>

                  <div className="pt-6 border-t border-border/30 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                      Tham gia lúc:{' '}
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(user.id)}
                        className="text-[10px] font-bold uppercase tracking-wider text-destructive/60 hover:text-destructive hover:bg-destructive/5"
                      >
                        Xóa người dùng
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
