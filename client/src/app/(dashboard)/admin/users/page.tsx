'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { User, USER_STATUS } from '@atomecom/shared';
import { useUsers } from '@/hooks/use-users';
import { UserTable } from '@/components/dashboard/users/views/user-table';
import { UserFormOverlay } from '@/components/dashboard/users/overlays/user-form-overlay';
import { UserDetailSheet as UserDetailOverlay } from '@/components/dashboard/users/overlays/user-detail-sheet';
import { UserFilters } from '@/components/dashboard/users/controls/user-filters';
import { UserStats } from '@/components/dashboard/users/controls/user-stats';
import { StudioConfirmationDialog } from '@/components/dashboard/studio/studio-confirmation-dialog';
import { useTableParams } from '@/hooks/use-table-params';
import { useDebounce } from '@/hooks/use-debounce';
import { Loader2 } from 'lucide-react';

export default function UsersPage() {
  // ─── States ────────────────────────────────────────────────
  // ─── Table & URL State ─────────────────────────────────────
  const { params, setParams, clearParams } = useTableParams({
    limit: 20,
    sortField: 'createdAt',
    sortOrder: 'desc',
  });

  const debouncedSearch = useDebounce(params.q, 500);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'role',
    'status',
    'joined',
    'lastLogin',
    'activity',
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info' | 'primary';
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    variant: 'danger',
  });

  // ─── Data Fetching ─────────────────────────────────────────
  const { user: currentUser } = useAuth();
  const {
    users,
    pagination,
    isLoading,
    isFetching,
    createUser,
    isCreating,
    updateUser,
    updateUserAsync,
    isUpdating,
    deleteUser,
    stats,
    isLoadingStats,
  } = useUsers({
    keyword: debouncedSearch,
    role: params.role === 'all' ? undefined : params.role,
    status:
      params.status === 'all' ? undefined : (params.status as USER_STATUS),
    page: params.page,
    limit: params.limit,
  });

  // ─── Handlers ──────────────────────────────────────────────
  const handleToggleColumn = (colId: string) => {
    setVisibleColumns((prev) =>
      prev.includes(colId) ? prev.filter((c) => c !== colId) : [...prev, colId],
    );
  };

  const handleClearFilters = () => {
    clearParams();
  };

  const activeFilterCount =
    (params.role !== 'all' && params.role ? 1 : 0) +
    (params.status !== 'all' && params.status ? 1 : 0);

  const handleViewDetails = (user: User) => {
    setDetailUser(user);
    setIsDetailOpen(true);
  };

  const handleDeleteUser = (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Xác nhận xóa tài khoản?',
      description:
        'Hành động này sẽ xóa vĩnh viễn tài khoản người dùng khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?',
      variant: 'danger',
      onConfirm: () => deleteUser(id),
    });
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col p-6 md:p-8 animate-in fade-in duration-500 overflow-hidden bg-background">
      {/* 1. Utilities Bar */}
      <UserFilters
        visibleColumns={visibleColumns}
        onToggleColumn={handleToggleColumn}
        onAddAction={() => setIsFormOpen(true)}
      />

      {/* 2. Stats Section */}
      <div className="mb-8">
        <UserStats
          total={stats.total}
          active={stats.active}
          verified={stats.verified}
          banned={stats.banned}
          deactive={stats.deactive}
          isLoading={isLoadingStats}
        />
      </div>

      {/* 3. Table Area */}
      <div className="flex-1 overflow-hidden relative min-h-[400px] flex flex-col border-[0.5px] border-border/40 rounded-sm bg-background shadow-none">
        {isLoading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 text-foreground/20 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                Đang đồng bộ dữ liệu người dùng...
              </p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <UserTable
            users={users}
            currentUser={currentUser}
            sortField={params.sortField || 'createdAt'}
            sortOrder={params.sortOrder || 'desc'}
            onSort={(field) => {
              if (params.sortField === field)
                setParams({
                  sortOrder: params.sortOrder === 'asc' ? 'desc' : 'asc',
                });
              else {
                setParams({ sortField: field, sortOrder: 'asc' });
              }
            }}
            onEdit={handleViewDetails}
            onDelete={handleDeleteUser}
            onViewDetails={handleViewDetails}
            visibleColumns={visibleColumns}
            pagination={{
              totalElements: pagination.totalElements,
              currentPage: pagination.currentPage,
              totalPages: pagination.totalPages,
              limit: params.limit,
              onPageChange: (p) => setParams({ page: p }),
              onLimitChange: (l) => setParams({ limit: l }),
            }}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* ─── Overlays ─── */}
      <UserFormOverlay
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={(data) => {
          createUser(data);
          setIsFormOpen(false);
        }}
        isLoading={isCreating}
      />

      <UserDetailOverlay
        user={detailUser}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onDelete={(id: string) => {
          setIsDetailOpen(false);
          handleDeleteUser(id);
        }}
        onUpdate={async (id: string, data: any) => {
          await updateUserAsync({ id, data });
          setDetailUser((prev) => (prev ? { ...prev, ...data } : prev));
        }}
        isUpdating={isUpdating}
      />

      <StudioConfirmationDialog
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
