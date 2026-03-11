'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalElements: number;
}

interface StudioPaginationProps {
  pagination: PaginationData | null;
  currentCount: number;
  itemName: string;
  onPageChange: (page: number) => void;
}

export function StudioPagination({
  pagination,
  currentCount,
  itemName,
  onPageChange,
}: StudioPaginationProps) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const current = pagination.currentPage;
  const total = pagination.totalPages;
  const pages: (number | string)[] = [];

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(total);
    } else if (current >= total - 3) {
      pages.push(1);
      pages.push('...');
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      pages.push(current - 1);
      pages.push(current);
      pages.push(current + 1);
      pages.push('...');
      pages.push(total);
    }
  }

  return (
    <div className="flex items-center px-5 py-3 border-t border-border/10 bg-muted/5 backdrop-blur-sm z-20">
      <div className="flex-1 hidden md:flex items-center gap-1.5 text-[10px] uppercase tracking-wide">
        <span className="font-bold text-foreground/80">{currentCount}</span>
        <span className="text-muted-foreground/40 font-medium px-1 capitalize">
          tổng số
        </span>
        <span className="font-bold text-foreground/80">
          {pagination.totalElements}
        </span>
        <span className="text-muted-foreground/50 font-bold ml-0.5">
          {itemName}
        </span>
      </div>

      <div className="flex items-center gap-1 flex-1 md:flex-none justify-center">
        <Button
          variant="ghost"
          size="icon"
          disabled={current <= 1}
          onClick={() => onPageChange(1)}
          className="h-8 w-8 rounded-md disabled:opacity-20 hover:bg-muted/50"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={current <= 1}
          onClick={() => onPageChange(current - 1)}
          className="h-8 w-8 rounded-md disabled:opacity-20 hover:bg-muted/50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-0.5 mx-1">
          {pages.map((p, i) =>
            p === '...' ? (
              <span
                key={`sep-${i}`}
                className="text-[10px] font-bold text-muted-foreground/20 px-1"
              >
                ···
              </span>
            ) : (
              <Button
                key={`page-${p}`}
                variant={current === p ? 'default' : 'ghost'}
                size="icon"
                onClick={() => onPageChange(p as number)}
                className={cn(
                  'h-8 w-8 rounded-md text-xs font-bold transition-all shadow-none',
                  current === p
                    ? 'bg-foreground text-background shadow-none border border-border/10'
                    : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground',
                )}
              >
                {p}
              </Button>
            ),
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          disabled={current >= total}
          onClick={() => onPageChange(current + 1)}
          className="h-8 w-8 rounded-md disabled:opacity-20 hover:bg-muted/50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={current >= total}
          onClick={() => onPageChange(total)}
          className="h-8 w-8 rounded-md disabled:opacity-20 hover:bg-muted/50"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 hidden md:block" />
    </div>
  );
}
