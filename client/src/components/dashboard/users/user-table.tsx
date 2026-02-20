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
  return (
    <TableHead
      className={`py-3 px-4 font-bold text-xs uppercase tracking-wide text-muted-foreground cursor-pointer group hover:text-primary transition-colors ${className ?? ''}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field ? (
          sortOrder === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )
        ) : (
          <ArrowUpDown className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
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
    <div className="flex flex-col rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md overflow-hidden shadow-xl shadow-primary/5 h-fit max-h-full">
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border/40">
              <SortableTableHead
                field="name"
                sortField={sortField}
                sortOrder={sortOrder}
                onSort={onSort}
              >
                {t('users.table.columns.user')}
              </SortableTableHead>
              {visibleColumns.includes('role') && (
                <TableHead className="py-3 px-4 font-bold text-xs uppercase tracking-wide text-muted-foreground">
                  {t('users.table.columns.role')}
                </TableHead>
              )}
              {visibleColumns.includes('status') && (
                <TableHead className="py-3 px-4 font-bold text-xs uppercase tracking-wide text-muted-foreground">
                  {t('users.table.columns.status')}
                </TableHead>
              )}
              {visibleColumns.includes('lastLogin') && (
                <TableHead className="py-3 px-4 font-bold text-xs uppercase tracking-wide text-muted-foreground">
                  {t('users.table.columns.last_login')}
                </TableHead>
              )}
              {visibleColumns.includes('activity') && (
                <TableHead className="py-3 px-4 font-bold text-xs uppercase tracking-wide text-muted-foreground">
                  {t('users.table.columns.activity')} (7d)
                </TableHead>
              )}
              {visibleColumns.includes('joined') && (
                <SortableTableHead
                  field="createdAt"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={onSort}
                >
                  {t('users.table.columns.joined')}
                </SortableTableHead>
              )}
              <TableHead className="py-3 px-4 text-right font-bold text-xs uppercase tracking-wide text-muted-foreground">
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
                    <TableCell className="py-3 px-4">
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  )}
                  {visibleColumns.includes('status') && (
                    <TableCell className="py-3 px-4">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  )}
                  {visibleColumns.includes('lastLogin') && (
                    <TableCell className="py-3 px-4">
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                  )}
                  {visibleColumns.includes('activity') && (
                    <TableCell className="py-3 px-4">
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  )}
                  {visibleColumns.includes('joined') && (
                    <TableCell className="py-3 px-4">
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
                  className="group hover:bg-blue-600/[0.03] transition-colors border-border/40 cursor-pointer"
                  onClick={() => onViewDetails(user)}
                >
                  <TableCell className="py-4 px-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-10 w-10 border border-primary/20 ring-2 ring-background ring-offset-1 transition-transform group-hover:scale-105">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {user.isOnline && (
                          <span className="absolute bottom-0 right-0 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-background"></span>
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
                          {user.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {maskEmail(user.email)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  {visibleColumns.includes('role') && (
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {user.role === USER_ROLE.ADMIN ||
                        user.role === USER_ROLE.OWNER ? (
                          <Shield className="h-4 w-4 text-primary" />
                        ) : (
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            'text-xs font-bold uppercase tracking-wider',
                            user.role === USER_ROLE.ADMIN ||
                              user.role === USER_ROLE.OWNER
                              ? 'text-primary'
                              : 'text-muted-foreground',
                          )}
                        >
                          {t(`users.table.roles.${user.role.toLowerCase()}`)}
                        </span>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('status') && (
                    <TableCell className="py-4 px-4">
                      <div
                        className="flex flex-col gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {user.isVerified ? (
                          <Badge
                            variant="outline"
                            className="w-fit bg-emerald-500/10 text-emerald-600 border-emerald-500/10 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1.5" />
                            {t('users.table.status.verified')}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="w-fit bg-amber-500/10 text-amber-600 border-amber-500/10 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm shadow-amber-500/5 ring-1 ring-amber-500/20 transition-all hover:bg-amber-500/20"
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
                                'w-fit text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-sm ring-1 transition-all',
                                canManageUser(user)
                                  ? 'cursor-pointer hover:scale-105 active:scale-95'
                                  : 'cursor-not-allowed opacity-80',
                                user.status === USER_STATUS.ACTIVE
                                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/10 shadow-blue-500/5 ring-blue-500/20'
                                  : user.status === USER_STATUS.BANNED
                                    ? 'bg-rose-500/10 text-rose-600 border-rose-500/10 shadow-rose-500/5 ring-rose-500/20'
                                    : user.status === USER_STATUS.DELETED
                                      ? 'bg-slate-500/10 text-slate-600 border-slate-500/10 shadow-slate-500/5 ring-slate-500/20'
                                      : 'bg-muted/10 text-muted-foreground border-border/50 ring-border/20',
                              )}
                            >
                              <div className="flex items-center gap-1.5">
                                {user.status === USER_STATUS.ACTIVE ? (
                                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
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
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest px-2 py-1.5 opacity-50">
                              {t('users.table.actions.set_status')}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                onUpdateUser?.(user.id, {
                                  status: USER_STATUS.ACTIVE,
                                })
                              }
                              className={cn(
                                'rounded-lg text-[10px] font-bold uppercase tracking-widest gap-2 py-2 cursor-pointer transition-colors',
                                user.status === USER_STATUS.ACTIVE
                                  ? 'bg-blue-600/10 text-blue-600 focus:bg-blue-600/20 focus:text-blue-700'
                                  : 'focus:bg-blue-600/10 focus:text-blue-600',
                              )}
                            >
                              <CheckCircle2
                                className={cn(
                                  'h-3.5 w-3.5',
                                  user.status === USER_STATUS.ACTIVE
                                    ? 'text-blue-600'
                                    : 'text-blue-600/70',
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
                    <TableCell className="py-4 px-4">
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
                    <TableCell className="py-4 px-4">
                      <div className="h-8 w-24 opacity-60 group-hover:opacity-100 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={activityData[index]}>
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#2563eb"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </TableCell>
                  )}
                  {visibleColumns.includes('joined') && (
                    <TableCell className="py-4 px-4">
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
                          className="h-8 w-8 rounded-lg hover:bg-blue-600/10 hover:text-blue-600 transition-colors"
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

      {/* Integrated Pagination Footer */}
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/20 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t('users.table.pagination.show')}
              </span>
              <select
                value={pagination.limit}
                onChange={(e) =>
                  pagination.onLimitChange(Number(e.target.value))
                }
                className="bg-transparent border border-border/50 rounded-lg text-[10px] font-black py-1 px-1.5 focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:inline opacity-70">
              {users.length} {t('users.table.pagination.of')}{' '}
              {pagination.totalElements} {t('users.title')}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              disabled={pagination.currentPage <= 1}
              onClick={() =>
                pagination.onPageChange(pagination.currentPage - 1)
              }
              className="h-7 w-7 rounded-lg border-border/50 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
            </Button>

            <div className="flex items-center gap-1.5 px-3">
              <span className="text-[10px] font-black text-primary">
                {pagination.currentPage}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">
                /
              </span>
              <span className="text-[10px] font-bold text-muted-foreground">
                {pagination.totalPages || 1}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() =>
                pagination.onPageChange(pagination.currentPage + 1)
              }
              className="h-7 w-7 rounded-lg border-border/50 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30"
            >
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
