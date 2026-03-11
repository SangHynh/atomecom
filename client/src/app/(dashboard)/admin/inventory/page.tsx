'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { InventoryHeader } from '@/components/dashboard/inventory/inventory-header';
import { InventoryFilters } from '@/components/dashboard/inventory/inventory-filters';
import { InventoryTable } from '@/components/dashboard/inventory/inventory-table';
import { StudioPagination } from '@/components/dashboard/studio/studio-pagination';
import { useTableParams } from '@/hooks/use-table-params';
import { useDebounce } from '@/hooks/use-debounce';
import { useSkus } from '@/hooks/use-skus';
import { extractData, extractPagination } from '@/lib/api-utils';

export default function InventoryPage() {
  // ─── Table & URL State ─────────────────────────────────────
  const { params, setParams } = useTableParams({
    limit: 20,
    sortField: 'skuCode',
    sortOrder: 'asc',
  });

  const debouncedSearch = useDebounce(params.q, 500);

  // ─── Data Fetching ─────────────────────────────────────────
  const {
    data: skusResponse,
    isLoading,
    isFetching,
  } = useSkus({
    keyword: debouncedSearch || undefined,
    page: params.page,
    limit: params.limit,
    status: params.status !== 'all' ? params.status : undefined,
  });

  const skus = extractData(skusResponse) || [];
  const pagination = extractPagination(skusResponse);

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col p-6 md:p-8 bg-background relative overflow-hidden animate-in fade-in duration-500">
      {/* 1. Page Header */}
      <InventoryHeader />

      {/* 2. Filter Bar (self-managed via useTableParams) */}
      <InventoryFilters />

      {/* 3. Main Content */}
      <div className="flex-1 overflow-hidden relative min-h-[400px] flex flex-col border-[0.5px] border-border/40 rounded-sm bg-background/50 shadow-none">
        {isLoading && !isFetching ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 text-foreground/20 animate-spin" />
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <InventoryTable data={skus} />
        </div>

        {/* 4. Pagination */}
        <div className="border-t border-border/40 bg-background/80 backdrop-blur-md px-6 shrink-0 h-14 flex items-center">
          <StudioPagination
            pagination={pagination}
            currentCount={skus.length}
            itemName="Biến thể (SKU)"
            onPageChange={(p) => setParams({ page: p })}
          />
        </div>
      </div>
    </div>
  );
}
