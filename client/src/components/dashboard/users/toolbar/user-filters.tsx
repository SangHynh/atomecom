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
          <button
            onClick={onAddAction}
            className="h-11 px-6 rounded-[var(--radius)] bg-foreground text-background hover:bg-foreground/90 font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2 shrink-0 transition-all active:scale-[0.98] border border-transparent"
          >
            <ChevronRight className="h-3 w-3 rotate-[-90deg] stroke-[3]" />
            Thêm tài khoản
          </button>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* Limit Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-11 px-4 rounded-[var(--radius)] border border-border/10 bg-background font-black text-[10px] uppercase tracking-[0.15em] gap-2 transition-all shrink-0 shadow-none hover:border-border/20"
              >
                <span className="text-muted-foreground/30 font-bold lowercase italic">
                  hiển thị:
                </span>
                <span>{params.limit} items</span>
                <ChevronRight className="h-3 w-3 opacity-30 rotate-90" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-40 rounded-[var(--radius)] border-border/40 shadow-2xl p-1 bg-background/95 backdrop-blur-xl"
            >
              {[5, 10, 20, 50].map((val) => (
                <DropdownMenuItem
                  key={val}
                  onClick={() => setParams({ limit: val })}
                  className={cn(
                    'font-black text-[10px] uppercase justify-center rounded-none cursor-pointer py-3 transition-colors tracking-[0.1em]',
                    params.limit === val
                      ? 'bg-foreground text-background'
                      : 'focus:bg-muted/50',
                  )}
                >
                  {val} bản ghi
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
                  'h-11 px-4 rounded-[var(--radius)] border border-border/10 font-black uppercase tracking-[0.15em] gap-2 transition-all text-[10px] shrink-0 shadow-none',
                  activeFilterCount > 0
                    ? 'border-foreground/30 bg-foreground/5 text-foreground'
                    : 'border-border/40 bg-background hover:border-border/60 text-muted-foreground/40',
                )}
              >
                <Filter className="h-3.5 w-3.5 opacity-60" />
                Lọc nâng cao
                {activeFilterCount > 0 && (
                  <span className="h-4 w-4 flex items-center justify-center rounded-none bg-foreground text-background text-[8px] font-black ml-1 scale-110">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 rounded-[var(--radius)] border-border/40 shadow-2xl p-2 bg-background/95 backdrop-blur-xl"
            >
              <DropdownMenuLabel className="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 p-3 leading-loose">
                Phân quyền hệ thống
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setParams({ role: 'all' })}
                className="rounded-none text-[10px] font-black uppercase tracking-[0.15em] p-3 cursor-pointer gap-3"
              >
                <div className={cn(
                  "h-1.5 w-1.5 rounded-none border border-border/40",
                  params.role === 'all' ? "bg-foreground" : "bg-transparent"
                )} />
                Tất cả vai trò
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setParams({ role: USER_ROLE.ADMIN })}
                className="rounded-none text-[10px] font-black uppercase tracking-[0.15em] p-3 cursor-pointer gap-3"
              >
                <div className={cn(
                  "h-1.5 w-1.5 rounded-none border border-border/40",
                  params.role === USER_ROLE.ADMIN ? "bg-foreground" : "bg-transparent"
                )} />
                Quản trị viên
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setParams({ role: USER_ROLE.USER })}
                className="rounded-none text-[10px] font-black uppercase tracking-[0.15em] p-3 cursor-pointer gap-3"
              >
                <div className={cn(
                  "h-1.5 w-1.5 rounded-none border border-border/40",
                  params.role === USER_ROLE.USER ? "bg-foreground" : "bg-transparent"
                )} />
                Khách hàng
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-2 bg-border/40" />

              <DropdownMenuLabel className="font-black text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 p-3 leading-loose">
                Tình trạng hồ sơ
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setParams({ status: 'all' })}
                className="rounded-none text-[10px] font-black uppercase tracking-[0.15em] p-3 cursor-pointer gap-3"
              >
                <div className={cn(
                  "h-1.5 w-1.5 rounded-none border border-border/40",
                  params.status === 'all' ? "bg-foreground" : "bg-transparent"
                )} />
                Tất cả trạng thái
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setParams({ status: USER_STATUS.ACTIVE })}
                className="rounded-none text-[10px] font-black uppercase tracking-[0.15em] p-3 cursor-pointer gap-3 focus:bg-success/5 focus:text-success"
              >
                <div className={cn(
                  "h-1.5 w-1.5 rounded-none border border-border/40",
                  params.status === USER_STATUS.ACTIVE ? "bg-success" : "bg-transparent"
                )} />
                Đang hoạt động
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setParams({ status: USER_STATUS.BANNED })}
                className="rounded-none text-[10px] font-black uppercase tracking-[0.15em] p-3 cursor-pointer gap-3 focus:bg-danger-soft/5 focus:text-danger-soft"
              >
                <div className={cn(
                  "h-1.5 w-1.5 rounded-none border border-border/40",
                  params.status === USER_STATUS.BANNED ? "bg-danger-soft" : "bg-transparent"
                )} />
                Đã khóa tài khoản
              </DropdownMenuItem>

              {activeFilterCount > 0 && (
                <>
                  <DropdownMenuSeparator className="my-2 bg-border/40" />
                  <DropdownMenuItem
                    onClick={() => clearParams()}
                    className="font-black text-[10px] uppercase tracking-[0.15em] text-white bg-destructive hover:bg-destructive/90 focus:bg-destructive focus:text-white rounded-none justify-center py-3.5"
                  >
                    Xóa tất cả bộ lọc
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Clear Filter */}
          <Button
            variant="outline"
            className={cn(
              'h-11 w-11 p-0 rounded-[var(--radius)] border-[0.5px] transition-all shadow-none group shrink-0',
              activeFilterCount > 0 || params.q
                ? 'text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10'
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
                className="h-11 w-11 p-0 rounded-[var(--radius)] border-[0.5px] border-border/40 bg-background/50 hover:border-border/60 transition-all shadow-none shrink-0"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground/30" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 rounded-[var(--radius)] border-[0.5px] border-border/40 shadow-2xl p-2 bg-background/95 backdrop-blur-xl"
            >
              <DropdownMenuLabel className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground/40 p-2">
                Công cụ hỗ trợ
              </DropdownMenuLabel>
              <DropdownMenuItem className="rounded-[var(--radius)] text-[11px] font-bold uppercase tracking-wider p-2.5 cursor-pointer gap-2">
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
                    className="flex items-center gap-3 px-2.5 py-2 hover:bg-muted/50 rounded-[var(--radius)] cursor-pointer transition-colors"
                    onClick={() => onToggleColumn(col.id)}
                  >
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full transition-all border border-border/40',
                        visibleColumns.includes(col.id)
                          ? 'bg-foreground border-foreground scale-110'
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





