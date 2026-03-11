'use client';

import React from 'react';
import { User, Users } from 'lucide-react';
import { User as UserType } from '@atomecom/shared';
import { Skeleton } from '@/components/ui/skeleton';
import { StudioPagination } from '@/components/dashboard/studio/studio-pagination';
import { SortableHeader } from '@/components/dashboard/studio/sortable-header';
import { StudioEmptyState } from '@/components/dashboard/studio/studio-empty-state';
import { UserRow } from './user-row';

interface UserTableProps {
  users: UserType[];
  currentUser?: UserType | null;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort: (field: string) => void;
  onEdit: (user: UserType) => void;
  onDelete: (id: string) => void;
  onViewDetails: (user: UserType) => void;
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
  onUpdateUser?: (id: string, data: Partial<UserType>) => void;
  visibleColumns?: string[];
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
  pagination,
  onClearFilters,
  isLoading,
  onUpdateUser,
  visibleColumns,
}: UserTableProps) {
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

  return (
    <div className="flex flex-col rounded-md border border-border/10 bg-background/60 backdrop-blur-md overflow-hidden shadow-none ring-0 flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="min-w-[1100px]">
          {/* Table Header */}
          <div className="grid grid-cols-[300px_150px_180px_150px_120px_150px_auto] items-center border-b border-border/10 sticky top-0 bg-background/90 backdrop-blur-md z-10 px-2">
            <SortableHeader
              label="Định danh người dùng"
              field="name"
              currentField={sortField}
              currentOrder={sortOrder}
              onSort={onSort}
            />
            <SortableHeader
              label="Quyền hạn"
              field="role"
              currentField={sortField}
              currentOrder={sortOrder}
              onSort={onSort}
            />
            <SortableHeader
              label="Trạng thái"
              field="status"
              currentField={sortField}
              currentOrder={sortOrder}
              onSort={onSort}
            />
            <SortableHeader label="Truy cập cuối" />
            <SortableHeader label="Hoạt động" />
            <SortableHeader
              label="Ngày gia nhập"
              field="createdAt"
              currentField={sortField}
              currentOrder={sortOrder}
              onSort={onSort}
            />
            <div className="px-4 py-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40 text-right">
              Thao tác
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/10">
            {isLoading ? (
              Array.from({ length: pagination?.limit || 5 }).map((_, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[300px_150px_180px_150px_120px_150px_auto] items-center px-6 py-6 border-b border-border/20"
                >
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-11 w-11 rounded-sm" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-24 px-4" />
                  <Skeleton className="h-6 w-32 px-4" />
                  <Skeleton className="h-4 w-28 px-4" />
                  <Skeleton className="h-4 w-24 px-4" />
                  <Skeleton className="h-4 w-24 px-4" />
                  <div className="flex justify-end gap-2 px-4">
                    <Skeleton className="h-9 w-9 rounded-sm" />
                  </div>
                </div>
              ))
            ) : users.length === 0 ? (
              <StudioEmptyState
                icon={Users}
                title="Hồ sơ vắng bóng"
                description="Không tìm thấy người dùng nào khớp với tiêu chí tìm kiếm của bạn."
                actionLabel="Xóa bộ lọc tìm kiếm"
                onAction={onClearFilters}
              />
            ) : (
              users.map((user, index) => (
                <UserRow
                  key={user.id}
                  user={user}
                  currentUser={currentUser}
                  activityData={activityData[index]}
                  visibleColumns={visibleColumns}
                  onViewDetails={onViewDetails}
                  onEdit={onEdit}
                  onUpdateUser={onUpdateUser}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Integrated Pagination Footer */}
      {pagination && (
        <StudioPagination
          pagination={pagination}
          currentCount={users.length}
          itemName="Hồ sơ"
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
}
