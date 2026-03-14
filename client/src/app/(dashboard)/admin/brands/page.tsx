'use client';

import React, { useState } from 'react';
import { Search, RefreshCw, Loader2, LayoutGrid, List } from 'lucide-react';
import { useBrands } from '@/hooks/use-brands';
import { useStudioManager } from '@/hooks/use-studio-manager';
import { BrandTable } from '@/components/dashboard/catalog/brand/table/brand-table';
import { BrandExplorer } from '@/components/dashboard/catalog/brand/explorer/brand-explorer';
import { BrandDetailOverlay } from '@/components/dashboard/catalog/brand/overlays/details/brand-detail-overlay';
import { BrandFormOverlay } from '@/components/dashboard/catalog/brand/overlays/form/brand-form-overlay';
import { BrandFilters } from '@/components/dashboard/catalog/brand/toolbar/brand-filters';
import { Button } from '@/components/ui/button';
import { useConfirmation } from '@/components/dashboard/studio/studio-confirmation-provider';
import { StudioPagination } from '@/components/dashboard/studio/studio-pagination';
import { Brand } from '@atomecom/shared';
import { useDebounce } from '@/hooks/use-debounce';
import { useTableParams } from '@/hooks/use-table-params';

export default function BrandsPage() {
  // ─── Table & URL State ─────────────────────────────────────
  const { params, setParams, clearParams } = useTableParams({
    limit: 20,
    sortField: 'name',
    sortOrder: 'asc',
  });

  const debouncedSearch = useDebounce(params.q, 500);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  const {
    selectedId: selectedBrandId,
    editingId: editingBrandId,
    isFormOpen,
    isDetailOpen: isDetailOpenOverlay,
    openForm,
    closeForm,
    openDetail,
    closeDetail,
  } = useStudioManager();

  const { confirm } = useConfirmation();

  // ─── Data Fetching ─────────────────────────────────────────
  const {
    brands,
    pagination,
    isLoading,
    isFetching,
    createBrand,
    createBrandAsync,
    isCreating,
    updateBrand,
    updateBrandAsync,
    isUpdating,
    deleteBrand,
  } = useBrands({
    keyword: debouncedSearch,
    page: params.page,
    limit: params.limit,
    sortBy: params.sortField,
    sortOrder: params.sortOrder,
  });

  const selectedBrand = brands.find((b) => b.id === selectedBrandId) || null;
  const editingBrand = brands.find((b) => b.id === editingBrandId) || null;

  // ─── Handlers ──────────────────────────────────────────────
  const handleCreate = () => openForm(null);
  const handleEdit = (brand: Brand) => openForm(brand.id);
  const handleViewDetail = (brand: Brand) => openDetail(brand.id);

  const handleDelete = (id: string) => {
    confirm({
      title: 'Xóa thương hiệu này?',
      description: 'Toàn bộ thông tin thương hiệu sẽ bị gỡ bỏ khỏi hệ thống. Các sản phẩm đang liên kết có thể hiển thị dưới dạng thương hiệu không xác định.',
      variant: 'danger',
      onConfirm: async () => {
        await deleteBrand(id);
      },
    });
  };

  const onFormSubmit = async (data: any) => {
    if (editingBrand) {
      await updateBrandAsync({ id: editingBrand.id, data }).then(() => {
        closeForm();
      });
    } else {
      await createBrandAsync(data).then(() => {
        closeForm();
      });
    }
  };

  const handleSort = (field: string) => {
    if (params.sortField === field) {
      setParams({ sortOrder: params.sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      setParams({ sortField: field, sortOrder: 'asc' });
    }
  };

  const handleRefresh = () => {
    clearParams();
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col p-6 md:p-8 bg-background relative animate-in fade-in duration-500 overflow-hidden">
      <BrandFilters
        isFetching={isFetching}
        onRefresh={handleRefresh}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddAction={handleCreate}
      />

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative min-h-0 flex flex-col border-[0.5px] border-border/40 rounded-sm bg-background shadow-none">
        {isLoading && !isFetching && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 text-foreground/20 animate-spin" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {viewMode === 'table' ? (
            <BrandTable
              brands={brands}
              isLoading={isLoading}
              sortField={params.sortField || 'name'}
              sortOrder={params.sortOrder || 'asc'}
              onSort={handleSort}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <div className="p-8">
              <BrandExplorer
                brands={brands}
                isLoading={isLoading}
                onView={handleViewDetail}
              />
            </div>
          )}
        </div>

        <div className="border-t border-border/40 bg-background/80 backdrop-blur-md px-6 shrink-0 h-14 flex items-center">
          <StudioPagination
            pagination={pagination || null}
            currentCount={brands.length}
            itemName="Thương hiệu"
            onPageChange={(p) => setParams({ page: p })}
          />
        </div>
      </div>

      {/* Modals */}
      <BrandFormOverlay
        isOpen={isFormOpen}
        onClose={closeForm}
        initialData={editingBrand ?? undefined}
        onSubmit={onFormSubmit}
        isLoading={isCreating || isUpdating}
      />

      <BrandDetailOverlay
        brand={selectedBrand}
        isOpen={isDetailOpenOverlay}
        onClose={closeDetail}
        onUpdate={(id: string, data: any, onSuccess: () => void) => {
          updateBrand({ id, data }, { onSuccess });
        }}
        onDelete={handleDelete}
        isUpdating={isUpdating}
      />


    </div>
  );
}
