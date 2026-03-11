'use client';

import React from 'react';
import { Search, RefreshCw, LayoutGrid, List, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTableParams } from '@/hooks/use-table-params';
import { StudioSearchInput } from '@/components/dashboard/studio/studio-search-input';

interface BrandFiltersProps {
  isFetching: boolean;
  onRefresh: () => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  onAddAction: () => void;
}

export function BrandFilters({
  isFetching,
  onRefresh,
  viewMode,
  onViewModeChange,
  onAddAction,
}: BrandFiltersProps) {
  const { params, setParams } = useTableParams();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 sticky top-0 bg-background/80 backdrop-blur-md z-20 py-3 border-b border-border/10">
      <div className="flex flex-1 items-center gap-4">
        {/* Search */}
        <StudioSearchInput
          placeholder="Tìm theo tên thương hiệu..."
          value={params.q || ''}
          onChange={(v) => setParams({ q: v })}
          containerClassName="flex-1"
        />

        {/* Add Action */}
        <Button
          onClick={onAddAction}
          className="h-11 px-6 rounded-md bg-foreground text-background hover:bg-foreground/90 font-bold text-[10px] uppercase tracking-wide gap-2 shrink-0 shadow-none border border-border/10"
        >
          <Plus className="h-3.5 w-3.5" />
          Thêm thương hiệu
        </Button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        {/* Refresh */}
        <Button
          variant="outline"
          size="icon"
          className="h-11 w-11 rounded-md border border-border/10 group hover:border-border/20 transition-all shrink-0 shadow-none bg-background"
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
        <div className="flex items-center gap-1 border border-border/10 p-1 rounded-md h-11 bg-muted/5 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-9 w-9 rounded-md transition-all',
              viewMode === 'grid'
                ? 'bg-foreground text-background shadow-none px-0'
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
              'h-9 w-9 rounded-md transition-all',
              viewMode === 'table'
                ? 'bg-foreground text-background shadow-none px-0'
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
