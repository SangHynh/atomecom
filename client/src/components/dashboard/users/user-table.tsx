'use client';

import React from 'react';
import {
  MoreVertical,
  Trash2,
  Shield,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  MoreHorizontal,
  Eye,
  Edit,
  Ban,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { User, USER_ROLE, USER_STATUS } from '@atomecom/shared';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn, maskEmail } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { UserEmptyState } from './user-empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

// ─── Internal sub-component ─────────────────────────────────────────────────
interface SortableTableHeadProps {
  field: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort: (field: string) => void;
  className?: string;
  children: React.ReactNode;
}

function SortableTableHead({
  field,
  sortField,
  sortOrder,
  onSort,
  className,
  children,
}: SortableTableHeadProps) {
  const isActive = sortField === field;
  return (
    <TableHead
      className={cn(
        'sticky top-0 z-20 py-4 px-4 font-bold text-[11px] uppercase tracking-wider cursor-pointer group transition-all duration-200 border-b',
        'bg-muted/90 dark:bg-zinc-900 border-border/60 hover:bg-muted',
        isActive
          ? 'text-primary border-b-primary/30'
          : 'text-muted-foreground/60 hover:text-muted-foreground border-b-border/30',
        className ?? '',
      )}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        <span
          className={cn(
            'transition-all duration-200',
            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
          )}
        >
          {isActive ? (
            sortOrder === 'asc' ? (
              <ArrowUp className="h-3 w-3 text-primary" />
            ) : (
              <ArrowDown className="h-3 w-3 text-primary" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3" />
          )}
        </span>
      </div>
    </TableHead>
  );
}
// ────────────────────────────────────────────────────────────────────────────

interface UserTableProps {
  users: User[];
  currentUser?: User | null;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort: (field: string) => void;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onViewDetails: (user: User) => void;
  visibleColumns?: string[];
  pagination?: {
    totalElements: number;
    currentPage: number;
    totalPages: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
  onClearFilters?: () => void;
  isLoading?: boolean;
  onUpdateUser?: (id: string, data: Partial<User>) => void;
}

export function UserTable({
  users,
  currentUser,
  sortField,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  onViewDetails,
  visibleColumns = ['role', 'status', 'joined', 'lastLogin', 'activity'],
  pagination,
  onClearFilters,
  isLoading,
  onUpdateUser,
}: UserTableProps) {
  const { t } = useTranslation();

  // Mock background activity data for each row
  const activityData = React.useMemo(
    () =>
      users.map(() =>
        Array.from({ length: 7 }, () => ({
          value: Math.floor(Math.random() * 100),
        })),
      ),
    [users],
  );

  const canManageUser = (targetUser: User) => {
    if (!currentUser) return false;
    // 1. Cannot manage self (Ban/Delete)
    if (currentUser.id === targetUser.id) return false;
    // 2. OWNER is untouchable
    if (targetUser.role === USER_ROLE.OWNER) return false;
    // 3. Hierarchy
    if (currentUser.role === USER_ROLE.OWNER) return true;
    if (
      currentUser.role === USER_ROLE.ADMIN &&
      targetUser.role === USER_ROLE.USER
    )
      return true;
    return false;
  };

  const canEditUser = (targetUser: User) => {
    if (!currentUser) return true; // Fallback
    if (currentUser.id === targetUser.id) return true; // Can edit self
    return canManageUser(targetUser);
  };
  return (
    <div className="flex flex-col rounded-2xl border border-border/40 bg-background/60 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/5 ring-1 ring-border/20 flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-0">
              <TableHead className="sticky top-0 z-20 bg-muted/90 dark:bg-zinc-900 py-4 px-4 font-bold text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/60">
                {t('users.table.columns.user')}
              </TableHead>
              {visibleColumns.includes('role') && (
                <TableHead className="sticky top-0 z-10 bg-muted/90 dark:bg-zinc-900 py-4 px-4 font-bold text-[11px] uppercase tracking-wider text-muted-foreground hidden md:table-cell border-b border-border/60">
                  {t('users.table.columns.role')}
                </TableHead>
              )}
              {visibleColumns.includes('status') && (
                <TableHead className="sticky top-0 z-20 bg-muted/90 dark:bg-zinc-900 py-4 px-4 font-bold text-[11px] uppercase tracking-wider text-muted-foreground hidden sm:table-cell border-b border-border/60">
                  {t('users.table.columns.status')}
                </TableHead>
              )}
              {visibleColumns.includes('lastLogin') && (
                <TableHead className="sticky top-0 z-10 bg-muted/90 dark:bg-zinc-900 py-4 px-4 font-bold text-[11px] uppercase tracking-wider text-muted-foreground hidden md:table-cell border-b border-border/60">
                  {t('users.table.columns.last_login')}
                </TableHead>
              )}
              {visibleColumns.includes('activity') && (
                <TableHead className="sticky top-0 z-20 bg-muted/90 dark:bg-zinc-900 py-4 px-4 font-bold text-[11px] uppercase tracking-wider text-muted-foreground hidden lg:table-cell border-b border-border/60">
                  {t('users.table.columns.activity')} (7d)
                </TableHead>
              )}
              {visibleColumns.includes('joined') && (
                <TableHead className="sticky top-0 z-10 bg-muted/90 dark:bg-zinc-900 py-4 px-4 font-bold text-[11px] uppercase tracking-wider text-muted-foreground hidden xl:table-cell border-b border-border/60">
                  {t('users.table.columns.joined')}
                </TableHead>
              )}
              <TableHead className="sticky top-0 z-20 bg-muted/90 dark:bg-zinc-900 py-4 px-4 text-right font-bold text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/60">
                {t('users.table.columns.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pagination?.limit || 5 }).map((_, i) => (
                <TableRow key={i} className="border-border/40">
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </TableCell>
                  {visibleColumns.includes('role') && (
                    <TableCell className="py-3 px-4 hidden md:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  )}
                  {visibleColumns.includes('status') && (
                    <TableCell className="py-3 px-4 hidden sm:table-cell">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  )}
                  {visibleColumns.includes('lastLogin') && (
                    <TableCell className="py-3 px-4 hidden md:table-cell">
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                  )}
                  {visibleColumns.includes('activity') && (
                    <TableCell className="py-3 px-4 hidden lg:table-cell">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  )}
                  {visibleColumns.includes('joined') && (
                    <TableCell className="py-3 px-4 hidden xl:table-cell">
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                  )}
                  <TableCell className="py-3 px-4 text-right">
                    <Skeleton className="h-10 w-10 ml-auto rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 1} className="py-0">
                  <UserEmptyState
                    onClearFilters={onClearFilters || (() => {})}
                  />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, index) => (
                <TableRow
                  key={user.id}
                  className="group relative even:bg-primary/[0.05] odd:bg-transparent hover:bg-primary/10 data-[state=selected]:bg-primary/15 transition-all duration-200 border-border/30 cursor-pointer"
                  onClick={() => onViewDetails(user)}
                >
                  <TableCell className="py-3.5 px-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative shrink-0">
                        <Avatar className="h-9 w-9 border-2 border-background ring-1 ring-border/40 group-hover:ring-primary/30 transition-all duration-200 shadow-sm group-hover:shadow-md group-hover:shadow-primary/10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-black text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {user.isOnline && (
                          <span className="absolute bottom-0 right-0 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-background"></span>
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-bold text-[15px] tracking-tight text-foreground group-hover:text-primary transition-colors duration-150 truncate">
                          {user.name}
                        </span>
                        <span className="text-[13px] text-muted-foreground font-medium truncate">
                          {maskEmail(user.email)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  {visibleColumns.includes('role') && (
                    <TableCell className="py-4 px-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        {user.role === USER_ROLE.ADMIN ||
                        user.role === USER_ROLE.OWNER ? (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm shadow-amber-500/5 ring-1 ring-amber-500/20"
                          >
                            <Shield className="h-3 w-3 mr-1.5" />
                            {t(`users.table.roles.${user.role.toLowerCase()}`)}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-muted/50 text-muted-foreground border-border/50 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm ring-1 ring-border/50"
                          >
                            <UserIcon className="h-3 w-3 mr-1.5" />
                            {t(`users.table.roles.${user.role.toLowerCase()}`)}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('status') && (
                    <TableCell className="py-4 px-4 hidden sm:table-cell">
                      <div
                        className="flex flex-col gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {user.isVerified ? (
                          <Badge
                            variant="outline"
                            className="w-fit bg-primary/10 text-primary border-primary/10 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 shadow-sm shadow-primary/5 ring-1 ring-primary/20"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1.5" />
                            {t('users.table.status.verified')}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="w-fit bg-amber-500/10 text-amber-600 border-amber-500/10 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 shadow-sm shadow-amber-500/5 ring-1 ring-amber-500/20 transition-all hover:bg-amber-500/20"
                          >
                            <Clock className="h-3 w-3 mr-1.5" />
                            {t('users.table.status.pending')}
                          </Badge>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            disabled={!canManageUser(user)}
                          >
                            <Badge
                              variant="outline"
                              className={cn(
                                'w-fit text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 shadow-sm ring-1 transition-all',
                                canManageUser(user)
                                  ? 'cursor-pointer hover:scale-105 active:scale-95'
                                  : 'cursor-not-allowed opacity-80',
                                user.status === USER_STATUS.ACTIVE
                                  ? 'bg-primary/20 text-primary border-primary/20 shadow-primary/5 ring-primary/30'
                                  : user.status === USER_STATUS.BANNED
                                    ? 'bg-rose-500/10 text-rose-600 border-rose-500/10 shadow-rose-500/5 ring-rose-500/20'
                                    : user.status === USER_STATUS.DELETED
                                      ? 'bg-slate-500/10 text-slate-600 border-slate-500/10 shadow-slate-500/5 ring-slate-500/20'
                                      : 'bg-muted/10 text-muted-foreground border-border/50 ring-border/20',
                              )}
                            >
                              <div className="flex items-center gap-1.5">
                                {user.status === USER_STATUS.ACTIVE ? (
                                  <CheckCircle2 className="h-3 w-3 text-primary" />
                                ) : user.status === USER_STATUS.BANNED ? (
                                  <Ban className="h-3 w-3 text-rose-600" />
                                ) : user.status === USER_STATUS.DELETED ? (
                                  <Trash2 className="h-3 w-3 text-slate-600" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-muted-foreground" />
                                )}
                                {t(
                                  `users.table.status.${user.status.toLowerCase()}`,
                                )}
                                {canManageUser(user) && (
                                  <ChevronRight className="h-3 w-3 opacity-50 rotate-90" />
                                )}
                              </div>
                            </Badge>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-40 rounded-xl border-border/50 backdrop-blur-xl bg-background/95 p-1 shadow-2xl"
                          >
                            <DropdownMenuLabel className="text-[11px] font-black uppercase tracking-widest px-2 py-1.5 opacity-60">
                              {t('users.table.actions.set_status')}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                onUpdateUser?.(user.id, {
                                  status: USER_STATUS.ACTIVE,
                                })
                              }
                              className={cn(
                                'rounded-lg text-[11px] font-bold uppercase tracking-widest gap-2 py-2 cursor-pointer transition-colors',
                                user.status === USER_STATUS.ACTIVE
                                  ? 'bg-primary/10 text-primary focus:bg-primary/20 focus:text-primary'
                                  : 'focus:bg-primary/10 focus:text-primary',
                              )}
                            >
                              <CheckCircle2
                                className={cn(
                                  'h-3.5 w-3.5',
                                  user.status === USER_STATUS.ACTIVE
                                    ? 'text-primary'
                                    : 'text-primary/70',
                                )}
                              />
                              <span className="flex-1">
                                {t('users.table.actions.active')}
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                onUpdateUser?.(user.id, {
                                  status: USER_STATUS.BANNED,
                                })
                              }
                              className={cn(
                                'rounded-lg text-[10px] font-bold uppercase tracking-widest gap-2 py-2 cursor-pointer transition-colors',
                                user.status === USER_STATUS.BANNED
                                  ? 'bg-rose-600/10 text-rose-600 focus:bg-rose-600/20 focus:text-rose-700'
                                  : 'focus:bg-rose-600/10 focus:text-rose-600',
                              )}
                            >
                              <Ban
                                className={cn(
                                  'h-3.5 w-3.5',
                                  user.status === USER_STATUS.BANNED
                                    ? 'text-rose-600'
                                    : 'text-rose-600/70',
                                )}
                              />
                              <span className="flex-1">
                                {t('users.table.actions.banned')}
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('lastLogin') && (
                    <TableCell className="py-4 px-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <span className="text-xs font-bold uppercase tracking-wide">
                          {user.lastLoginAt
                            ? formatDistanceToNow(new Date(user.lastLoginAt), {
                                addSuffix: true,
                              })
                            : t('users.table.never')}
                        </span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('activity') && (
                    <TableCell className="py-4 px-4 hidden lg:table-cell">
                      <div className="h-8 w-24 opacity-60 group-hover:opacity-100 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={activityData[index]}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="var(--primary)"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('joined') && (
                    <TableCell className="py-4 px-4 hidden xl:table-cell">
                      <span className="text-xs font-bold text-muted-foreground uppercase opacity-70">
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </TableCell>
                  )}
                  <TableCell
                    className="py-4 px-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-2 text-right">
                      {canEditUser(user) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(user)}
                          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                          title={t('users.table.actions.edit')}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Integrated Pagination Footer - Desktop Only */}
      {pagination && (
        <div className="hidden sm:flex items-center px-5 py-3 border-t border-border/30 bg-muted/10 backdrop-blur-sm">
          {/* Left spacer for count */}
          <div className="flex-1 flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-foreground/80">
            <span className="text-primary">{users.length}</span>
            <span className="text-muted-foreground/60 font-medium lowercase italic px-0.5">
              {t('users.table.pagination.of')}
            </span>
            <span className="text-primary">{pagination.totalElements}</span>
            <span className="ml-1 text-muted-foreground/80">
              {t('users.title')}
            </span>
          </div>

          {/* Centered Pagination */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(1)}
              className="h-8 w-8 rounded-lg border-border/40 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-20 cursor-pointer shadow-sm"
              title={t('users.table.pagination.first', 'First Page')}
            >
              <ChevronLeftIcon className="h-4 w-4 -mr-2" />
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.currentPage <= 1}
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
              className="h-8 w-8 rounded-lg border-border/40 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-20 cursor-pointer shadow-sm"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1 mx-1">
              {(() => {
                const total = pagination.totalPages;
                const current = pagination.currentPage;
                const pages: (number | string)[] = [];

                if (total <= 7) {
                  for (let i = 1; i <= total; i++) pages.push(i);
                } else {
                  if (current <= 4) {
                    for (let i = 1; i <= 5; i++) pages.push(i);
                    pages.push('...');
                    pages.push(total);
                  } else if (current >= total - 3) {
                    pages.push(1);
                    pages.push('...');
                    for (let i = total - 4; i <= total; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    pages.push('...');
                    pages.push(current - 1);
                    pages.push(current);
                    pages.push(current + 1);
                    pages.push('...');
                    pages.push(total);
                  }
                }

                return pages.map((p, i) =>
                  p === '...' ? (
                    <span
                      key={`sep-${i}`}
                      className="text-[10px] font-bold text-muted-foreground/30 px-1"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={`page-${p}`}
                      variant={current === p ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => pagination.onPageChange(p as number)}
                      className={cn(
                        'h-8 w-8 rounded-lg text-xs font-black transition-all shadow-sm cursor-pointer',
                        current === p
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-none'
                          : 'border-border/40 hover:bg-primary/10 hover:text-primary',
                      )}
                    >
                      {p}
                    </Button>
                  ),
                );
              })()}
            </div>

            <Button
              variant="outline"
              size="icon"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
              className="h-8 w-8 rounded-lg border-border/40 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-20 cursor-pointer shadow-sm"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              className="h-8 w-8 rounded-lg border-border/40 hover:bg-violet-500/10 hover:text-violet-600 transition-all disabled:opacity-20 cursor-pointer shadow-sm"
              title={t('users.table.pagination.last', 'Last Page')}
            >
              <ChevronRightIcon className="h-4 w-4" />
              <ChevronRightIcon className="h-4 w-4 -ml-2" />
            </Button>
          </div>

          {/* Right spacer to balance everything */}
          <div className="flex-1" />
        </div>
      )}
    </div>
  );
}
