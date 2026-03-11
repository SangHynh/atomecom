'use client';

import React from 'react';
import {
  Filter,
  RefreshCw,
  Download,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { USER_ROLE, USER_STATUS } from '@atomecom/shared';
import { cn } from '@/lib/utils';
import { StudioSearchInput } from '@/components/dashboard/studio/studio-search-input';

import { useTableParams } from '@/hooks/use-table-params';

interface UserFiltersProps {
  visibleColumns: string[];
  onToggleColumn: (colId: string) => void;
  onAddAction: () => void;
}

export function UserFilters({
  visibleColumns,
  onToggleColumn,
  onAddAction,
}: UserFiltersProps) {
  const { params, setParams, clearParams } = useTableParams();

  const activeFilterCount =
    (params.role !== 'all' && params.role ? 1 : 0) +
    (params.status !== 'all' && params.status ? 1 : 0);

  return (
    <div className="flex flex-col gap-4 mb-8 sticky top-0 bg-background/80 backdrop-blur-md z-20 py-3 border-b border-border/10">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-3">
          {/* Search */}
          <StudioSearchInput
            placeholder="Tìm theo tên hiển thị, email hoặc số điện thoại định danh..."
            value={params.q || ''}
            onChange={(v) => setParams({ q: v })}
            containerClassName="flex-1"
          />

          {/* Add Action */}
          <Button
            onClick={onAddAction}
            className="h-11 px-6 rounded-md bg-foreground text-background hover:bg-foreground/90 font-bold text-[10px] uppercase tracking-wide gap-2 shrink-0 shadow-none border border-border/10"
          >
            <ChevronRight className="h-3 w-3 rotate-[-90deg]" />
            Thêm người dùng
          </Button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* Limit Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-11 px-4 rounded-md border border-border/10 bg-background font-bold text-[10px] uppercase tracking-wide gap-2 transition-all shrink-0 shadow-none hover:border-border/20"
              >
                <span className="text-muted-foreground/30 font-medium lowercase">
                  Hiển thị:
                </span>
                <span>{params.limit} hàng</span>
                <ChevronRight className="h-3 w-3 opacity-30 rotate-90" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-32 rounded-sm border-[0.5px] border-border/40 shadow-none p-1"
            >
              {[5, 10, 20, 50].map((val) => (
                <DropdownMenuItem
                  key={val}
                  onClick={() => setParams({ limit: val })}
                  className={cn(
                    'font-bold text-[10px] uppercase justify-center rounded-md cursor-pointer py-2.5 transition-colors',
                    params.limit === val
                      ? 'bg-primary/10 text-primary'
                      : 'focus:bg-muted/50',
                  )}
                >
                  {val} hàng
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Advanced Filters */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-11 px-4 rounded-md border border-border/10 font-bold uppercase tracking-wide gap-2 transition-all text-[10px] shrink-0 shadow-none',
                  activeFilterCount > 0
                    ? 'border-primary/30 bg-primary/5 text-primary'
                    : 'border-border/40 bg-background hover:border-border/60 text-muted-foreground/40',
                )}
              >
                <Filter className="h-3.5 w-3.5 opacity-60" />
                Bộ lọc nâng cao
                {activeFilterCount > 0 && (
                  <span className="h-4 w-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[8px] font-bold ml-1 scale-110">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 rounded-sm border-[0.5px] border-border/40 shadow-2xl p-2 bg-background/95 backdrop-blur-xl"
            >
              <DropdownMenuLabel className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground/40 p-2 leading-loose">
                Phân quyền truy cập
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setParams({ role: 'all' })}
                className="rounded-sm text-[11px] font-bold uppercase tracking-wider p-2.5 cursor-pointer gap-2"
              >
                {params.role === 'all' && (
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                )}
                Tất cả vai trò
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setParams({ role: USER_ROLE.ADMIN })}
                className="rounded-sm text-[11px] font-bold uppercase tracking-wider p-2.5 cursor-pointer gap-2"
              >
                {params.role === USER_ROLE.ADMIN && (
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                )}
                Quản trị viên
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setParams({ role: USER_ROLE.USER })}
                className="rounded-sm text-[11px] font-bold uppercase tracking-wider p-2.5 cursor-pointer gap-2"
              >
                {params.role === USER_ROLE.USER && (
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                )}
                Khách hàng
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2 bg-border/10" />

              <DropdownMenuLabel className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground/40 p-2 leading-loose">
                Tình trạng hồ sơ
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setParams({ status: 'all' })}
                className="rounded-sm text-[11px] font-bold uppercase tracking-wider p-2.5 cursor-pointer gap-2"
              >
                {params.status === 'all' && (
                  <div className="h-1.5 w-1.5 rounded-full bg-foreground" />
                )}
                Tất cả trạng thái
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setParams({ status: USER_STATUS.ACTIVE })}
                className="rounded-sm text-[11px] font-bold uppercase tracking-wider p-2.5 cursor-pointer gap-2 focus:bg-emerald-500/5 focus:text-emerald-600"
              >
                {params.status === USER_STATUS.ACTIVE && (
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
                Đang hoạt động
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setParams({ status: USER_STATUS.BANNED })}
                className="rounded-sm text-[11px] font-bold uppercase tracking-wider p-2.5 cursor-pointer gap-2 focus:bg-rose-500/5 focus:text-rose-600"
              >
                {params.status === USER_STATUS.BANNED && (
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                )}
                Đã khóa tài khoản
              </DropdownMenuItem>

              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator className="my-2 bg-border/10" />
                  <DropdownMenuItem
                    onClick={() => clearParams()}
                    className="font-bold text-[10px] uppercase tracking-wider text-rose-500 focus:bg-rose-500/5 focus:text-rose-500 rounded-md justify-center py-3 bg-rose-500/5"
                  >
                    Làm mới bộ lọc
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Clear Filter */}
          <Button
            variant="outline"
            className={cn(
              'h-11 w-11 p-0 rounded-sm border-[0.5px] transition-all shadow-none group shrink-0 shrink-0',
              activeFilterCount > 0 || params.q
                ? 'text-rose-500 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10'
                : 'text-muted-foreground/20 border-border/40 bg-background hover:border-border/60',
            )}
            onClick={() => clearParams()}
            disabled={activeFilterCount === 0 && !params.q}
          >
            <RefreshCw
              className={cn(
                'h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-700',
                (activeFilterCount > 0 || params.q) && 'opacity-100',
              )}
            />
          </Button>

          {/* Tools Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-11 w-11 p-0 rounded-sm border-[0.5px] border-border/40 bg-background/50 hover:border-border/60 transition-all shadow-none shrink-0"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground/30" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 rounded-sm border-[0.5px] border-border/40 shadow-2xl p-2 bg-background/95 backdrop-blur-xl"
            >
              <DropdownMenuLabel className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground/40 p-2">
                Công cụ hỗ trợ
              </DropdownMenuLabel>
              <DropdownMenuItem className="rounded-sm text-[11px] font-bold uppercase tracking-wider p-2.5 cursor-pointer gap-2">
                <Download className="h-3.5 w-3.5 opacity-40" />
                Xuất dữ liệu CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-border/10" />
              <DropdownMenuLabel className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground/40 p-2">
                Hiển thị cột dữ liệu
              </DropdownMenuLabel>
              <div className="space-y-1 mt-1">
                {[
                  { id: 'role', label: 'Vai trò' },
                  { id: 'status', label: 'Trạng thái' },
                  { id: 'joined', label: 'Ngày gia nhập' },
                  { id: 'lastLogin', label: 'Truy cập' },
                  { id: 'activity', label: 'Hoạt động' },
                ].map((col) => (
                  <div
                    key={col.id}
                    className="flex items-center gap-3 px-2.5 py-2 hover:bg-muted/50 rounded-sm cursor-pointer transition-colors"
                    onClick={() => onToggleColumn(col.id)}
                  >
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full transition-all border border-border/40',
                        visibleColumns.includes(col.id)
                          ? 'bg-primary border-primary scale-110'
                          : 'bg-transparent',
                      )}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-tight">
                      {col.label}
                    </span>
                  </div>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
