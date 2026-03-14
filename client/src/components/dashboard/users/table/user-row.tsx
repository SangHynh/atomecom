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
import { canManageUser, canEditUser, isPrivileged } from '@/lib/user-permissions';

interface UserRowProps {
  user: User;
  currentUser?: User | null;
  activityData: Array<{ value: number }>;
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
  const isUserManageable = canManageUser(currentUser, user);
  const isUserEditable = canEditUser(currentUser, user);
  const isUserPrivileged = isPrivileged(user);

  return (
    <div
      onClick={() => onViewDetails(user)}
      className="grid grid-cols-[300px_150px_180px_150px_120px_150px_auto] items-center px-2 py-5 hover:bg-muted/5 transition-all cursor-pointer group border-b border-border/10"
    >
      {/* Identity */}
      <div className="flex items-center gap-4 px-4 min-w-0">
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10 rounded-[var(--radius)] border border-border/20 group-hover:scale-105 transition-transform duration-500">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-muted text-foreground font-black text-lg">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {user.isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full bg-foreground opacity-20"></span>
              <span className="relative inline-flex h-3 w-3 bg-foreground border-2 border-background"></span>
            </span>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-black text-base leading-none truncate text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">
            {user.name}
          </span>
          <span className="text-[9px] text-muted-foreground/60 font-mono mt-1.5 truncate tracking-tight uppercase">
            {user.email}
          </span>
        </div>
      </div>

      {/* Role */}
      <div className="px-4">
        {isUserPrivileged ? (
          <Badge
            variant="outline"
            className="bg-foreground text-background border-transparent text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-none shadow-none"
          >
            Quản trị
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-transparent text-foreground border-foreground/30 text-[9px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-none shadow-none"
          >
            Khách hàng
          </Badge>
        )}
      </div>

      {/* Status */}
      <div
        className="px-4 flex flex-col gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5">
          {user.isVerified ? (
            <Badge
              variant="outline"
              className="bg-transparent text-foreground/40 border-foreground/10 text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-none shadow-none"
            >
              Verified
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-muted/30 text-muted-foreground/30 border-border/10 text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-none shadow-none"
            >
              Unverified
            </Badge>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={!isUserManageable}>
            <div
              className={cn(
                'flex items-center gap-2 px-2.5 py-1.5 rounded-none border text-[9px] font-black uppercase tracking-[0.15em] transition-all w-fit shadow-none',
                user.status === USER_STATUS.ACTIVE
                  ? 'bg-transparent text-foreground border-foreground/30'
                  : user.status === USER_STATUS.BANNED
                    ? 'bg-destructive text-destructive-foreground border-destructive'
                    : 'bg-muted text-muted-foreground border-border',
                isUserManageable
                  ? 'cursor-pointer hover:bg-foreground/5'
                  : 'cursor-default opacity-50',
              )}
            >
              {user.status}
              {isUserManageable && (
                <Clock className="h-2.5 w-2.5 opacity-40 ml-1" />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-48 rounded-none border-border p-1 shadow-none bg-background/95 backdrop-blur-md"
          >
            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-3 py-2">
              Thiết lập trạng thái
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                onUpdateUser?.(user.id, { status: USER_STATUS.ACTIVE })
              }
              className="text-[10px] font-black uppercase tracking-[0.1em] py-2.5 px-3 rounded-none cursor-pointer gap-2"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Kích hoạt
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onUpdateUser?.(user.id, { status: USER_STATUS.BANNED })
              }
              className="text-[10px] font-black uppercase tracking-[0.1em] py-2.5 px-3 rounded-none cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Ban className="h-3.5 w-3.5" /> Khóa tài khoản
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Last Login */}
      <div className="px-4">
        <div className="flex items-center gap-2 text-muted-foreground/40 font-mono text-[9px] uppercase font-bold tracking-tight">
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
      <div className="px-4 opacity-20 group-hover:opacity-40 transition-opacity">
        <div className="h-6 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activityData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="currentColor"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Joined Date */}
      <div className="px-4 text-right pr-6">
        <span className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-[0.1em] font-mono">
          {format(new Date(user.createdAt), 'dd.MM')}
          <span className="ml-0.5 opacity-50">.26</span>
        </span>
      </div>

      {/* Actions */}
      <div
        className="px-4 flex justify-end"
        onClick={(e) => e.stopPropagation()}
      >
        {isUserEditable && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(user)}
            className="h-10 w-10 border border-border/10 opacity-0 group-hover:opacity-100 hover:bg-foreground hover:text-background transition-all rounded-[var(--radius)] shadow-none"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}





