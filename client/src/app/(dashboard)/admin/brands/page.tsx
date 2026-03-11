'use client';

import React, { useState } from 'react';
import { Search, RefreshCw, Loader2, LayoutGrid, List } from 'lucide-react';
import { useBrands, useBrand } from '@/hooks/use-brands';
import { useStudioManager } from '@/hooks/use-studio-manager';
import { BrandTable } from '@/components/dashboard/catalog/brand/views/brand-table';
import { BrandGrid } from '@/components/dashboard/catalog/brand/views/brand-grid';
import { BrandDetailOverlay } from '@/components/dashboard/catalog/brand/overlays/brand-detail-overlay';
import { BrandFormOverlay } from '@/components/dashboard/catalog/brand/overlays/brand-form-overlay';
import { BrandFilters } from '@/components/dashboard/catalog/brand/controls/brand-filters';
import { Button } from '@/components/ui/button';
import { StudioConfirmationDialog } from '@/components/dashboard/studio/studio-confirmation-dialog';
import { StudioPagination } from '@/components/dashboard/studio/studio-pagination';
import { Brand } from '@atomecom/shared';
import { useDebounce } from '@/hooks/use-debounce';
import { useTableParams } from '@/hooks/use-table-params';
import { extractData } from '@/lib/api-utils';
import { cn } from '@/lib/utils';

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
    confirmDelete,
    openForm,
    closeForm,
    openDetail,
    closeDetail,
    openDeleteConfirm,
    closeDeleteConfirm,
  } = useStudioManager();

  // ─── Data Fetching ─────────────────────────────────────────
  const {
    brands,
    pagination,
    isLoading,
    isFetching,
    createBrand,
    isCreating,
    updateBrand,
    isUpdating,
    deleteBrand,
  } = useBrands({
    keyword: debouncedSearch,
    page: params.page,
    limit: params.limit,
    sortBy: params.sortField,
    sortOrder: params.sortOrder,
  });

  const { data: selectedBrandInfo } = useBrand(selectedBrandId);
  const selectedBrand = extractData(selectedBrandInfo);

  const { data: editingBrandInfo } = useBrand(editingBrandId);
  const editingBrand = extractData(editingBrandInfo);

  // ─── Handlers ──────────────────────────────────────────────
  const handleCreate = () => openForm(null);
  const handleEdit = (brand: Brand) => openForm(brand.id);
  const handleDelete = (id: string) => openDeleteConfirm(id);
  const handleViewDetail = (brand: Brand) => openDetail(brand.id);

  const onFormSubmit = (data: any) => {
    if (editingBrand) {
      updateBrand({ id: editingBrand.id, data }, { onSuccess: closeForm });
    } else {
      createBrand(data, { onSuccess: closeForm });
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
              <BrandGrid
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

      <StudioConfirmationDialog
        isOpen={confirmDelete.isOpen}
        title="Xóa thương hiệu này?"
        description="Toàn bộ thông tin thương hiệu sẽ bị gỡ bỏ khỏi hệ thống. Các sản phẩm đang liên kết có thể hiển thị dưới dạng thương hiệu không xác định."
        variant="danger"
        onClose={closeDeleteConfirm}
        onConfirm={() => {
          deleteBrand(confirmDelete.id);
          closeDeleteConfirm();
        }}
      />
    </div>
  );
}
