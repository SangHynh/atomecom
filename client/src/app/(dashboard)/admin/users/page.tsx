'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { User, USER_STATUS } from '@atomecom/shared';
import { useUsers } from '@/hooks/use-users';
import { UserTable } from '@/components/dashboard/users/table/user-table';
import { UserFormOverlay } from '@/components/dashboard/users/overlays/form/user-form-overlay';
import { UserDetailOverlay } from '@/components/dashboard/users/overlays/details/user-detail-overlay';
import { UserFilters } from '@/components/dashboard/users/toolbar/user-filters';
import { UserStats } from '@/components/dashboard/users/metrics/user-stats';
import { useTableParams } from '@/hooks/use-table-params';
import { useDebounce } from '@/hooks/use-debounce';
import { useConfirmation } from '@/components/dashboard/studio/studio-confirmation-provider';
import { useStudioManager } from '@/hooks/use-studio-manager';
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

  const {
    selectedId: selectedUserId,
    isFormOpen,
    isDetailOpen,
    openForm,
    closeForm,
    openDetail,
    closeDetail,
  } = useStudioManager();

  const { confirm } = useConfirmation();

  // ─── Data Fetching ─────────────────────────────────────────
  const { user: currentUser } = useAuth();
  const {
    users,
    pagination,
    isLoading,
    isFetching,
    createUserAsync,
    isCreating,
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
  const detailUser = users.find((u) => u.id === selectedUserId) || null;

  // ─── Handlers ──────────────────────────────────────────────
  const handleToggleColumn = (colId: string) => {
    setVisibleColumns((prev) =>
      prev.includes(colId) ? prev.filter((c) => c !== colId) : [...prev, colId],
    );
  };

  const activeFilterCount =
    (params.role !== 'all' && params.role ? 1 : 0) +
    (params.status !== 'all' && params.status ? 1 : 0);

  const handleDeleteUser = (id: string) => {
    confirm({
      title: 'Xác nhận xóa tài khoản?',
      description: 'Hành động này sẽ xóa vĩnh viễn tài khoản người dùng khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?',
      variant: 'danger',
      onConfirm: async () => {
        await deleteUser(id);
        if (selectedUserId === id) closeDetail();
      },
    });
  };

  const onFormSubmit = async (data: any) => {
    await createUserAsync(data);
    closeForm();
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col p-6 md:p-8 animate-in fade-in duration-500 overflow-hidden bg-background">
      {/* 1. Utilities Bar */}
      <UserFilters
        visibleColumns={visibleColumns}
        onToggleColumn={handleToggleColumn}
        onAddAction={() => openForm(null)}
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
            onEdit={(u) => openDetail(u.id)}
            onDelete={handleDeleteUser}
            onViewDetails={(u) => openDetail(u.id)}
            visibleColumns={visibleColumns}
            totalElements={pagination.totalElements}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* ─── Overlays ─── */}
      <UserFormOverlay
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={onFormSubmit}
        isLoading={isCreating}
      />

      <UserDetailOverlay
        user={detailUser}
        isOpen={isDetailOpen}
        onClose={closeDetail}
        onDelete={(id: string) => {
          closeDetail();
          handleDeleteUser(id);
        }}
        onUpdate={async (id: string, data: any) => {
          await updateUserAsync({ id, data });
        }}
        isUpdating={isUpdating}
      />


    </div>
  );
}
