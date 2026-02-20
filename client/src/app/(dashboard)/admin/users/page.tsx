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
  }, [debouncedSearch, roleFilter, statusFilter, limit]);

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
    <div className="h-full flex flex-col p-4 md:p-5 lg:p-6 overflow-hidden">
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder={t('users.page.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-background/50 backdrop-blur-md border-border/50 rounded-xl focus:ring-primary/20 font-bold transition-all w-full text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-md transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-9 px-4 rounded-xl border-border/50 bg-background/50 backdrop-blur-md font-bold uppercase tracking-tight gap-2 transition-all text-[10px]',
                  activeFilterCount > 0 && 'border-primary/50 bg-primary/5',
                )}
              >
                <Filter
                  className={cn(
                    'h-3.5 w-3.5',
                    activeFilterCount > 0
                      ? 'text-primary'
                      : 'text-muted-foreground',
                  )}
                />
                {t('users.page.filter')}
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-4 w-4 p-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[8px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-xl border-border/50 shadow-2xl backdrop-blur-md bg-background/90 font-sans p-2">
              <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground px-2 py-1.5">
                {t('users.page.roles')}
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setRoleFilter('all')}
                className={cn(
                  'font-bold text-xs uppercase focus:bg-primary/10 rounded-lg',
                  roleFilter === 'all' && 'bg-primary/10 text-primary',
                )}
              >
                {t('users.page.all_roles')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setRoleFilter(USER_ROLE.ADMIN)}
                className={cn(
                  'font-bold text-xs uppercase focus:bg-primary/10 rounded-lg',
                  roleFilter === USER_ROLE.ADMIN &&
                    'bg-primary/10 text-primary',
                )}
              >
                {t('users.page.administrators')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setRoleFilter(USER_ROLE.USER)}
                className={cn(
                  'font-bold text-xs uppercase focus:bg-primary/10 rounded-lg',
                  roleFilter === USER_ROLE.USER && 'bg-primary/10 text-primary',
                )}
              >
                {t('users.page.customers')}
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2 bg-border/50" />

              <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground px-2 py-1.5">
                {t('users.page.account_status')}
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setStatusFilter('all')}
                className={cn(
                  'font-bold text-xs uppercase focus:bg-primary/10 rounded-lg',
                  statusFilter === 'all' && 'bg-primary/10 text-primary',
                )}
              >
                {t('users.page.all_accounts')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter(USER_STATUS.ACTIVE)}
                className={cn(
                  'font-bold text-xs uppercase focus:bg-primary/10 rounded-lg',
                  statusFilter === USER_STATUS.ACTIVE &&
                    'bg-primary/10 text-primary',
                )}
              >
                {t('users.page.active')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter(USER_STATUS.BANNED)}
                className={cn(
                  'font-bold text-xs uppercase focus:bg-primary/10 rounded-lg',
                  statusFilter === USER_STATUS.BANNED &&
                    'bg-primary/10 text-primary',
                )}
              >
                {t('users.page.banned')}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setStatusFilter(USER_STATUS.DEACTIVE)}
                className={cn(
                  'font-bold text-xs uppercase focus:bg-primary/10 rounded-lg',
                  statusFilter === USER_STATUS.DEACTIVE &&
                    'bg-primary/10 text-primary',
                )}
              >
                {t('users.page.deactive')}
              </DropdownMenuItem>

              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator className="my-2 bg-border/50" />
                  <DropdownMenuItem
                    onClick={clearFilters}
                    className="font-black text-[10px] uppercase tracking-widest text-rose-500 focus:bg-rose-500/10 focus:text-rose-500 rounded-lg text-center justify-center"
                  >
                    {t('users.page.reset_filters')}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            className="h-9 w-9 p-0 rounded-xl border-border/50 bg-background/50 backdrop-blur-md hover:text-blue-500 hover:bg-blue-500/5 transition-all shadow-sm active:scale-95"
            onClick={clearFilters}
          >
            <RefreshCw
              className={cn(
                'h-3.5 w-3.5',
                activeFilterCount > 0 && 'animate-spin',
              )}
            />
          </Button>

          <Button
            variant="outline"
            className="h-9 w-9 p-0 rounded-xl border-border/50 bg-background/50 backdrop-blur-md hover:text-primary transition-all"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 px-3 gap-2 rounded-xl border-border/50 bg-background/50 backdrop-blur-md hover:text-blue-500 hover:bg-blue-500/5 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
                {t('users.page.view')}
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
        </div>

        <Button
          onClick={handleCreateUser}
          className="rounded-xl h-9 px-5 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/25 active:scale-95 transition-all bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none"
        >
          <UserPlus className="h-3.5 w-3.5 mr-2" />
          {t('users.page.new_account')}
        </Button>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/20 backdrop-blur-[2px] rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                {t('users.page.syncing')}
              </span>
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-col min-h-0">
          <UserTable
            users={users}
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
              totalPages: pagination.totalPage,
              limit: limit,
              onPageChange: setPage,
              onLimitChange: setLimit,
            }}
            isLoading={isLoading}
            onUpdateUser={(id, data) => {
              const user = users.find((u) => u.id === id);
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
        </div>
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
