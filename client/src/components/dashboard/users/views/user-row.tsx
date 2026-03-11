'use client';

import React from 'react';
import {
  Shield,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Ban,
  Edit,
  Trash2,
} from 'lucide-react';
import { User, USER_ROLE, USER_STATUS } from '@atomecom/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, maskEmail } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface UserRowProps {
  user: User;
  currentUser?: User | null;
  activityData: any[];
  visibleColumns?: string[];
  onViewDetails: (user: User) => void;
  onEdit: (user: User) => void;
  onUpdateUser?: (id: string, data: Partial<User>) => void;
}

export function UserRow({
  user,
  currentUser,
  activityData,
  visibleColumns,
  onViewDetails,
  onEdit,
  onUpdateUser,
}: UserRowProps) {
  const canManageUser = () => {
    if (!currentUser) return false;
    if (currentUser.id === user.id) return false;
    if (user.role === USER_ROLE.OWNER) return false;
    if (currentUser.role === USER_ROLE.OWNER) return true;
    if (currentUser.role === USER_ROLE.ADMIN && user.role === USER_ROLE.USER)
      return true;
    return false;
  };

  const canEditUser = () => {
    if (!currentUser) return true;
    if (currentUser.id === user.id) return true;
    return canManageUser();
  };

  return (
    <div
      onClick={() => onViewDetails(user)}
      className="grid grid-cols-[300px_150px_180px_150px_120px_150px_auto] items-center px-2 py-5 hover:bg-muted/5 transition-all cursor-pointer group border-b border-border/10"
    >
      {/* Identity */}
      <div className="flex items-center gap-4 px-4 min-w-0">
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10 rounded-md border border-border/20 group-hover:scale-105 transition-transform duration-500">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-muted text-foreground font-semibold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {user.isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-background"></span>
            </span>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-base leading-none truncate text-foreground group-hover:text-primary transition-colors">
            {user.name}
          </span>
          <span className="text-[10px] text-muted-foreground/40 font-mono mt-1 truncate tracking-tight">
            {maskEmail(user.email)}
          </span>
        </div>
      </div>

      {/* Role */}
      <div className="px-4">
        {user.role === USER_ROLE.ADMIN || user.role === USER_ROLE.OWNER ? (
          <Badge
            variant="outline"
            className="bg-amber-500/5 text-amber-600 border-amber-500/10 text-[9px] font-bold uppercase tracking-wide px-2.5 shadow-none"
          >
            <Shield className="h-3 w-3 mr-1.5" />
            Quản trị
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-muted/30 text-muted-foreground/50 border-border/20 text-[9px] font-bold uppercase tracking-wide px-2.5 shadow-none"
          >
            <UserIcon className="h-3 w-3 mr-1.5" />
            Khách hàng
          </Badge>
        )}
      </div>

      {/* Status */}
      <div
        className="px-4 flex flex-col gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5">
          {user.isVerified ? (
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/10 text-[8px] font-bold uppercase tracking-wide px-2 shadow-none"
            >
              <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
              Verified
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-zinc-500/5 text-zinc-500 border-zinc-500/10 text-[8px] font-bold uppercase tracking-wide px-2 shadow-none"
            >
              Unverified
            </Badge>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!canManageUser()}>
            <div
              className={cn(
                'flex items-center gap-2 px-2.5 py-1 rounded-md border text-[9px] font-bold uppercase tracking-wide transition-all w-fit shadow-none',
                user.status === USER_STATUS.ACTIVE
                  ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10'
                  : user.status === USER_STATUS.BANNED
                    ? 'bg-rose-500/5 text-rose-600 border-rose-500/10'
                    : 'bg-zinc-500/5 text-zinc-500 border-zinc-500/10',
                canManageUser()
                  ? 'cursor-pointer hover:bg-opacity-20'
                  : 'cursor-default opacity-50',
              )}
            >
              {user.status}
              {canManageUser() && (
                <Clock className="h-2.5 w-2.5 opacity-40 ml-1" />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-44 rounded-md border-border/40 p-1 shadow-none"
          >
            <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40 px-2 py-1.5">
              Thiết lập trạng thái
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                onUpdateUser?.(user.id, { status: USER_STATUS.ACTIVE })
              }
              className="text-[10px] font-semibold uppercase tracking-wide py-2 rounded-md cursor-pointer gap-2"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Kích
              hoạt
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onUpdateUser?.(user.id, { status: USER_STATUS.BANNED })
              }
              className="text-[10px] font-semibold uppercase tracking-wide py-2 rounded-md cursor-pointer gap-2 text-rose-500 focus:text-rose-600"
            >
              <Ban className="h-3.5 w-3.5" /> Khóa tài khoản
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Last Login */}
      <div className="px-4">
        <div className="flex items-center gap-2 text-muted-foreground/50 font-mono text-[10px] uppercase font-semibold tracking-tight">
          <Clock className="h-3 w-3" />
          <span>
            {user.lastLoginAt
              ? formatDistanceToNow(new Date(user.lastLoginAt), {
                  addSuffix: true,
                  locale: vi,
                })
              : 'Chưa truy cập'}
          </span>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="px-4 opacity-30 group-hover:opacity-60 transition-opacity">
        <div className="h-6 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activityData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="currentColor"
                strokeWidth={1.2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Joined Date */}
      <div className="px-4">
        <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-wide font-mono">
          {format(new Date(user.createdAt), 'dd.MM.yyyy')}
        </span>
      </div>

      {/* Actions */}
      <div
        className="px-4 flex justify-end"
        onClick={(e) => e.stopPropagation()}
      >
        {canEditUser() && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(user)}
            className="h-10 w-10 rounded-md border border-border/10 opacity-0 group-hover:opacity-100 hover:bg-foreground hover:text-background transition-all"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
