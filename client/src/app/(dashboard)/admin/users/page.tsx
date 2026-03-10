'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  Download,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react';

import { User, USER_ROLE, USER_STATUS } from '@atomecom/shared';
import { useUsers } from '@/hooks/use-users';
import { Breadcrumbs } from '@/components/dashboard/breadcrumbs';
import { UserTable } from '@/components/dashboard/users/user-table';
import { UserForm } from '@/components/dashboard/users/user-form';
import { UserStats } from '@/components/dashboard/users/user-stats';
import { UserDetailSheet } from '@/components/dashboard/users/user-detail-sheet';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/dashboard/confirmation-dialog';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { X, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

import { useTranslation } from 'react-i18next';

export default function UsersPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'role',
    'status',
    'joined',
  ]);

  // Accumulated users for mobile "See More" (load-more / append)
  const [accumulatedUsers, setAccumulatedUsers] = useState<User[]>([]);

  const filters = {
    keyword: debouncedSearch,
    role: roleFilter === 'all' ? undefined : roleFilter,
    status: statusFilter === 'all' ? undefined : (statusFilter as any),
    page,
    limit,
  };

  const { user: currentUser } = useAuth();
  const {
    users,
    pagination,
    isLoading,
    isFetching,
    isError,
    createUser,
    isCreating,
    updateUser,
    updateUserAsync,
    isUpdating,
    deleteUser,
    deleteUserAsync,
    stats,
    isLoadingStats,
  } = useUsers(filters);

  // Reset page when search or filters change
  useEffect(() => {
    setPage(1);
    setAccumulatedUsers([]);
  }, [debouncedSearch, roleFilter, statusFilter, limit]);

  // Accumulate users on load-more (mobile) — skip when react-query is still fetching
  useEffect(() => {
    if (isFetching || !users || users.length === 0) return;
    if (page === 1) {
      setAccumulatedUsers(users);
    } else {
      setAccumulatedUsers((prev) => {
        const existingIds = new Set(prev.map((u: User) => u.id));
        const newOnes = users.filter((u: User) => !existingIds.has(u.id));
        return [...prev, ...newOnes];
      });
    }
  }, [users, isFetching]);

  const [isFormOpen, setIsFormOpen] = useState(false);

  // Confirmation Dialog State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info' | 'primary' | 'ban';
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    variant: 'danger',
  });

  // Filter users based on search query and advanced filters

  const clearFilters = () => {
    setRoleFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  const activeFilterCount =
    (roleFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);

  const handleCreateUser = () => {
    setIsFormOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: t('users.table.actions.delete'),
      description: t('users.page.delete_confirm', {
        defaultValue: 'Are you sure you want to delete this user?',
      }),
      variant: 'danger',
      onConfirm: () => deleteUser(id),
    });
  };

  const handleFormSubmit = (data: any) => {
    createUser(data);
    setIsFormOpen(false);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleViewDetails = (user: User) => {
    setDetailUser(user);
    setIsDetailOpen(true);
  };

  return (
    <div className="h-full flex flex-col p-2 md:p-5 lg:p-6 overflow-hidden">
      <Breadcrumbs />

      <UserStats
        total={stats.total}
        active={stats.active}
        verified={stats.verified}
        banned={stats.banned}
        deactive={stats.deactive}
        isLoading={isLoadingStats}
      />

      {/* Action Bar */}
      <div className="flex flex-col gap-2 mb-3">
        {/* Mobile-only search row */}
        <div className="relative group w-full sm:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300 z-10" />
          <Input
            placeholder={t('users.page.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/20 border-border/40 hover:border-border/70 rounded-xl font-medium transition-all duration-300 w-full text-xs placeholder:text-muted-foreground/40 focus-visible:bg-background focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:shadow-[0_0_12px_rgba(var(--primary-rgb),0.15)] focus-visible:ring-offset-0"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-md transition-colors z-10"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Utilities & Actions row (search inline on desktop) */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 -my-3 px-2 -mx-2 scrollbar-none">
          {/* Desktop search - inline */}
          <div className="relative group hidden sm:flex items-center shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300 z-10" />
            <Input
              placeholder={t('users.page.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 h-9 w-60 lg:w-80 bg-muted/20 hover:bg-muted/35 border-border/40 hover:border-border/70 rounded-xl font-medium transition-all duration-300 text-sm focus-visible:bg-background focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:shadow-[0_0_12px_rgba(var(--primary-rgb),0.15)] focus-visible:ring-offset-0 placeholder:text-muted-foreground/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded-md transition-colors z-10"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-8 px-2.5 rounded-lg border-border/50 bg-background font-black text-[11px] uppercase tracking-wider gap-1.5 transition-all shrink-0 active:scale-95 cursor-pointer shadow-sm"
              >
                <span className="text-muted-foreground">{limit}</span>
                <ChevronRight className="h-3 w-3 opacity-50 rotate-90" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-20 rounded-xl border-border/50 shadow-2xl backdrop-blur-md bg-background/90 p-1">
              {[5, 10, 20, 50].map((val) => (
                <DropdownMenuItem
                  key={val}
                  onClick={() => {
                    setLimit(val);
                    setPage(1);
                  }}
                  className={cn(
                    'font-black text-[11px] uppercase justify-center rounded-lg cursor-pointer py-1.5',
                    limit === val && 'bg-primary/10 text-primary',
                  )}
                >
                  {val}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-8 px-3 rounded-xl border font-bold uppercase tracking-wider gap-2 transition-all duration-200 text-[11px] shrink-0 active:scale-95 cursor-pointer shadow-sm',
                  activeFilterCount > 0
                    ? 'border-primary/40 bg-primary/10 text-primary shadow-sm shadow-primary/15 hover:bg-primary/20'
                    : 'border-border/50 bg-background hover:bg-muted/40 hover:border-border/70 text-foreground',
                )}
              >
                <Filter
                  className={cn(
                    'h-3 w-3 transition-transform duration-200',
                    activeFilterCount > 0
                      ? 'text-primary scale-110'
                      : 'text-muted-foreground',
                  )}
                />
                {t('users.page.filter')}
                {activeFilterCount > 0 && (
                  <span className="h-4 min-w-[1rem] px-1 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[8px] font-black">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-2xl border-border/40 shadow-2xl backdrop-blur-xl bg-background/95 font-sans p-2 animate-in zoom-in-90 slide-in-from-top-2 duration-150">
              <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80 px-2 py-1.5">
                {t('users.page.roles')}
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setRoleFilter('all');
                  setPage(1);
                }}
                className={cn(
                  'font-bold text-[13px] rounded-xl px-2.5 py-1.5 gap-2.5 transition-all cursor-pointer',
                  roleFilter === 'all'
                    ? 'bg-primary/10 text-primary font-black'
                    : 'focus:bg-muted/60',
                )}
              >
                {roleFilter === 'all' && (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                )}
                {t('users.page.all_roles')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setRoleFilter(USER_ROLE.ADMIN);
                  setPage(1);
                }}
                className={cn(
                  'font-bold text-[13px] rounded-xl px-2.5 py-1.5 gap-2.5 transition-all cursor-pointer',
                  roleFilter === USER_ROLE.ADMIN
                    ? 'bg-amber-500/10 text-amber-600 font-black'
                    : 'focus:bg-muted/60',
                )}
              >
                {roleFilter === USER_ROLE.ADMIN && (
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                )}
                {t('users.page.administrators')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setRoleFilter(USER_ROLE.USER);
                  setPage(1);
                }}
                className={cn(
                  'font-bold text-[13px] rounded-xl px-2.5 py-1.5 gap-2.5 transition-all cursor-pointer',
                  statusFilter === USER_ROLE.USER
                    ? 'bg-primary/10 text-primary font-black'
                    : 'focus:bg-muted/60',
                )}
              >
                {roleFilter === USER_ROLE.USER && (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                )}
                {t('users.page.customers')}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2 bg-border/30" />

              <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80 px-2 py-1.5">
                {t('users.page.account_status')}
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  setStatusFilter('all');
                  setPage(1);
                }}
                className={cn(
                  'font-bold text-[13px] rounded-xl px-2.5 py-1.5 gap-2.5 transition-all cursor-pointer',
                  statusFilter === 'all'
                    ? 'bg-primary/10 text-primary font-black'
                    : 'focus:bg-muted/60',
                )}
              >
                {statusFilter === 'all' && (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                )}
                {t('users.page.all_accounts')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setStatusFilter(USER_STATUS.ACTIVE);
                  setPage(1);
                }}
                className={cn(
                  'font-bold text-[13px] rounded-xl px-2.5 py-1.5 gap-2.5 transition-all',
                  statusFilter === USER_STATUS.ACTIVE
                    ? 'bg-primary/20 text-primary font-black'
                    : 'focus:bg-muted/60',
                )}
              >
                {statusFilter === USER_STATUS.ACTIVE && (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                )}
                {t('users.page.active')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setStatusFilter(USER_STATUS.BANNED);
                  setPage(1);
                }}
                className={cn(
                  'font-bold text-[13px] rounded-xl px-2.5 py-1.5 gap-2.5 transition-all',
                  statusFilter === USER_STATUS.BANNED
                    ? 'bg-rose-500/10 text-rose-600 font-black'
                    : 'focus:bg-muted/60',
                )}
              >
                {statusFilter === USER_STATUS.BANNED && (
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                )}
                {t('users.page.banned')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setStatusFilter(USER_STATUS.DEACTIVE);
                  setPage(1);
                }}
                className={cn(
                  'font-bold text-[13px] rounded-xl px-2.5 py-1.5 gap-2.5 transition-all',
                  statusFilter === USER_STATUS.DEACTIVE
                    ? 'bg-zinc-500/10 text-zinc-500 font-black'
                    : 'focus:bg-muted/60',
                )}
              >
                {statusFilter === USER_STATUS.DEACTIVE && (
                  <div className="h-1.5 w-1.5 rounded-full bg-zinc-500 shrink-0" />
                )}
                {t('users.page.deactive')}
              </DropdownMenuItem>

              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator className="my-2 bg-border/50" />
                  <DropdownMenuItem
                    onClick={clearFilters}
                    className="font-black text-[11px] uppercase tracking-widest text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 rounded-lg text-center justify-center py-2"
                  >
                    {t('users.page.reset_filters')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            className={cn(
              'h-8 w-8 p-0 rounded-lg border-border/50 bg-background transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer',
              activeFilterCount > 0
                ? 'text-primary border-primary/30 hover:bg-primary/10'
                : 'hover:text-primary hover:bg-primary/10 text-foreground',
            )}
            onClick={clearFilters}
            title={t('users.page.reset_filters')}
          >
            <RefreshCw
              className={cn('h-3 w-3', activeFilterCount > 0 && 'animate-spin')}
            />
          </Button>

          <Button
            variant="outline"
            className="h-8 w-8 p-0 rounded-lg border-border/50 bg-background/50 backdrop-blur-md hover:text-primary hover:bg-primary/5 transition-all shrink-0 cursor-pointer"
            title={t('dashboard.actions.download_report')}
          >
            <Download className="h-3 w-3" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden sm:flex">
              <Button
                variant="outline"
                className="h-8 w-8 p-0 rounded-lg border-border/50 bg-background/50 backdrop-blur-md hover:text-primary hover:bg-primary/5 transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer"
                title={t('users.page.view')}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-xl border-border/50 shadow-2xl backdrop-blur-md bg-background/90"
            >
              <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground px-3 py-2">
                {t('users.page.toggle_columns')}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <div className="p-2 space-y-1">
                {[
                  { id: 'role', label: t('users.form.role') },
                  { id: 'status', label: t('users.table.columns.status') },
                  { id: 'joined', label: t('users.table.columns.joined') },
                ].map((col) => (
                  <div
                    key={col.id}
                    className="flex items-center gap-2 px-2 py-1.5 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors"
                    onClick={() => {
                      setVisibleColumns((prev) =>
                        prev.includes(col.id)
                          ? prev.filter((c) => c !== col.id)
                          : [...prev, col.id],
                      );
                    }}
                  >
                    <span className="text-xs font-bold uppercase tracking-tight">
                      {col.label}
                    </span>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex-1" />

          {/* Add button: icon-only on mobile, icon+text on desktop */}
          <Button
            onClick={handleCreateUser}
            className="rounded-lg h-8 px-2 sm:px-3.5 gap-0 sm:gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white border-none shrink-0 cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[11px] font-black uppercase tracking-tight">
              {t('users.page.new_account')}
            </span>
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/30 backdrop-blur-[3px] rounded-2xl">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-background/80 border border-border/40 shadow-xl backdrop-blur-md">
              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                {t('users.page.syncing')}
              </span>
            </div>
          </div>
        )}
        <UserTable
          users={accumulatedUsers.length > 0 ? accumulatedUsers : users}
          currentUser={currentUser}
          sortField={sortField}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={handleViewDetails}
          onDelete={handleDeleteUser}
          onViewDetails={handleViewDetails}
          onClearFilters={() => {
            setSearchQuery('');
            setRoleFilter('all');
            setStatusFilter('all');
            setPage(1);
          }}
          visibleColumns={visibleColumns}
          pagination={{
            totalElements: pagination.totalElements,
            currentPage: pagination.currentPage,
            totalPages: pagination.totalPages,
            limit: limit,
            onPageChange: setPage,
            onLimitChange: setLimit,
          }}
          isLoading={isLoading}
          onUpdateUser={(id, data) => {
            const user = users.find((u: User) => u.id === id);
            if (!user || (data.status && user.status === data.status)) return;

            const statusLabel =
              data.status === USER_STATUS.ACTIVE
                ? t('users.page.active')
                : t('users.page.banned');

            setConfirmConfig({
              isOpen: true,
              title: t('users.page.status_confirm'),
              description: t('users.page.status_confirm_text', {
                status: statusLabel,
                defaultValue: `Are you sure you want to change this user status to ${statusLabel}?`,
              }),
              variant:
                data.status === USER_STATUS.ACTIVE ? 'primary' : 'warning',
              onConfirm: () => updateUser({ id, data }),
            });
          }}
        />

        {/* Mobile-only: See More floating button over table */}
        {pagination &&
          pagination.totalPages > pagination.currentPage &&
          !isLoading && (
            <div className="sm:hidden absolute bottom-4 inset-x-0 flex justify-center z-20 pointer-events-none">
              <button
                onClick={() =>
                  !isFetching && setPage(pagination.currentPage + 1)
                }
                disabled={isFetching}
                title={t('users.page.see_more')}
                className="pointer-events-auto group flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/70 backdrop-blur-md border border-border/40 hover:border-primary/30 shadow-md hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetching ? (
                  <Loader2 className="h-3 w-3 text-primary animate-spin" />
                ) : null}
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 group-hover:text-primary transition-colors duration-300">
                  {isFetching
                    ? t('users.page.syncing').replace('...', '')
                    : `${t('users.page.see_more')} ...`}
                </span>
              </button>
            </div>
          )}
      </div>

      <UserDetailSheet
        user={detailUser}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onDelete={(id) => {
          setIsDetailOpen(false);
          handleDeleteUser(id);
        }}
        onUpdate={async (id, data) => {
          await updateUserAsync({ id, data });
          // refresh detail user with updated data
          setDetailUser((prev) => (prev ? { ...prev, ...data } : prev));
        }}
        onRequestConfirm={(config) =>
          setConfirmConfig({ isOpen: true, ...config })
        }
        isUpdating={isUpdating}
      />

      {/* Create User Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl border-border/50 shadow-2xl backdrop-blur-xl bg-background/95">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tighter uppercase">
              {t('users.page.create_title')}
            </DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground pt-1">
              {t('users.page.create_desc')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <UserForm
              onSubmit={handleFormSubmit}
              isLoading={isCreating}
              currentUser={currentUser || undefined}
            />
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmationDialog
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        variant={confirmConfig.variant}
      />
    </div>
  );
}
