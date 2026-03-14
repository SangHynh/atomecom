'use client';

import React from 'react';
import { SlidersHorizontal, RefreshCw, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PRODUCT_STATUS } from '@atomecom/shared';
import { cn } from '@/lib/utils';
import { StudioSearchInput } from '@/components/dashboard/studio/studio-search-input';

import { useTableParams } from '@/hooks/use-table-params';

interface ProductFiltersProps {
  isFetching: boolean;
  onRefresh: () => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  onCreateAction: () => void;
}

export function ProductFilters({
  isFetching,
  onRefresh,
  viewMode,
  onViewModeChange,
  onCreateAction,
}: ProductFiltersProps) {
  const { params, setParams } = useTableParams();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 sticky top-0 bg-background/80 backdrop-blur-md z-20 py-3 border-b border-border/10">
      <div className="flex flex-1 items-center gap-4">
        {/* Search */}
        <StudioSearchInput
          placeholder="Tìm tên sản phẩm, mã SKU hoặc từ khóa thương mại..."
          value={params.q || ''}
          onChange={(v) => setParams({ q: v })}
          containerClassName="flex-1"
        />

        {/* Create Button */}
        <Button
          onClick={onCreateAction}
          className="h-11 px-6 rounded-[var(--radius)] bg-foreground text-background hover:bg-foreground/90 font-bold text-[10px] uppercase tracking-wide gap-2 shrink-0 shadow-none border border-border/10"
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Thêm sản phẩm
        </Button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        {/* Status Filter */}
        <Select
          value={params.status || 'all'}
          onValueChange={(v) => setParams({ status: v })}
        >
          <SelectTrigger className="h-11 w-48 rounded-[var(--radius)] border border-border/10 bg-transparent text-[10px] font-bold uppercase tracking-wide focus:ring-0 focus:border-primary/20 shadow-none px-4 group hover:border-border/20 shrink-0">
            <SlidersHorizontal className="h-3 w-3 mr-2 text-muted-foreground/40 group-hover:text-foreground/80 transition-colors" />
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent className="rounded-[var(--radius)] border-[0.5px] border-border/40 shadow-none">
            <SelectItem
              value="all"
              className="text-[10px] uppercase font-bold tracking-wide rounded-[var(--radius)] focus:bg-muted/50"
            >
              Tất cả sản phẩm
            </SelectItem>
            <SelectItem
              value={PRODUCT_STATUS.PUBLISHED}
              className="text-[10px] uppercase font-bold tracking-widest rounded-[var(--radius)] focus:bg-muted/50"
            >
              Đang hiển thị
            </SelectItem>
            <SelectItem
              value={PRODUCT_STATUS.DRAFT}
              className="text-[10px] uppercase font-bold tracking-widest rounded-[var(--radius)] focus:bg-muted/50"
            >
              Bản nháp
            </SelectItem>
            <SelectItem
              value={PRODUCT_STATUS.HIDDEN}
              className="text-[10px] uppercase font-bold tracking-widest rounded-[var(--radius)] focus:bg-muted/50"
            >
              Đã ẩn (Hidden)
            </SelectItem>
            <SelectItem
              value={PRODUCT_STATUS.DISCONTINUED}
              className="text-[10px] uppercase font-bold tracking-widest rounded-[var(--radius)] focus:bg-muted/50"
            >
              Ngừng kinh doanh
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Refresh */}
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-[var(--radius)] hover:bg-muted/10 transition-colors border border-border/10 group shrink-0"
          onClick={onRefresh}
        >
          <RefreshCw
            className={cn(
              'h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-foreground/60 transition-colors',
              isFetching && 'animate-spin',
            )}
          />
        </Button>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border border-border/10 p-1 rounded-[var(--radius)] h-11 bg-muted/5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9 rounded-[var(--radius)] transition-all',
              viewMode === 'grid'
                ? 'bg-foreground text-background shadow-lg shadow-foreground/10 px-0'
                : 'text-muted-foreground/30 hover:text-foreground hover:bg-muted/10',
            )}
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9 rounded-[var(--radius)] transition-all',
              viewMode === 'table'
                ? 'bg-foreground text-background shadow-lg shadow-foreground/10 px-0'
                : 'text-muted-foreground/30 hover:text-foreground hover:bg-muted/10',
            )}
            onClick={() => onViewModeChange('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}





