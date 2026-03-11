'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useProducts, useProduct } from '@/hooks/use-products';
import { useStudioManager } from '@/hooks/use-studio-manager';
import { ProductTable } from '@/components/dashboard/catalog/product/views/product-table';
import { ProductGrid } from '@/components/dashboard/catalog/product/views/product-grid';
import { ProductDetailOverlay } from '@/components/dashboard/catalog/product/overlays/product-detail-overlay';
import { ProductFormOverlay } from '@/components/dashboard/catalog/product/overlays/product-form-overlay';
import { ProductFilters } from '@/components/dashboard/catalog/product/controls/product-filters';
import { StudioConfirmationDialog } from '@/components/dashboard/studio/studio-confirmation-dialog';
import { StudioPagination } from '@/components/dashboard/studio/studio-pagination';
import { Product } from '@atomecom/shared';
import { useDebounce } from '@/hooks/use-debounce';
import { useTableParams } from '@/hooks/use-table-params';
import { extractData } from '@/lib/api-utils';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  // ─── Table & URL State ─────────────────────────────────────
  const { params, setParams, clearParams } = useTableParams({
    limit: 20,
    sortField: 'name',
    sortOrder: 'asc',
  });

  const debouncedSearch = useDebounce(params.q, 500);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  const {
    selectedId: selectedProductId,
    editingId: editingProductId,
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
    products,
    pagination,
    isLoading,
    isFetching,
    createProduct,
    createProductAsync,
    isCreating,
    updateProduct,
    updateProductAsync,
    isUpdating,
    deleteProduct,
  } = useProducts({
    keyword: debouncedSearch || undefined,
    page: params.page,
    limit: params.limit,
    sortField: params.sortField,
    sortOrder: params.sortOrder,
    status: params.status !== 'all' ? params.status : undefined,
  });

  const { data: selectedProductInfo } = useProduct(selectedProductId);
  const selectedProduct = extractData(selectedProductInfo);

  const { data: editingProductInfo } = useProduct(editingProductId);
  const editingProduct = extractData(editingProductInfo);

  // ─── Handlers ──────────────────────────────────────────────
  const handleCreate = () => openForm(null);
  const handleEdit = (product: Product) => openForm(product.id);
  const handleDelete = (id: string) => openDeleteConfirm(id);
  const handleViewDetail = (product: Product) => openDetail(product.id);

  const onFormSubmit = async (data: any) => {
    if (editingProduct) {
      return updateProductAsync({
        id: editingProduct.id,
        data: { ...data, version: editingProduct.version },
      }).then(() => {
        closeForm();
      });
    } else {
      return createProductAsync(data).then(() => {
        closeForm();
      });
    }
  };

  const handleSort = (field: string) => {
    if (params.sortField === field) {
      setParams({
        sortOrder: params.sortOrder === 'asc' ? 'desc' : 'asc',
      });
    } else {
      setParams({
        sortField: field,
        sortOrder: 'asc',
      });
    }
  };

  const handleRefresh = () => {
    clearParams();
  };

  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col p-6 md:p-8 bg-background relative overflow-hidden animate-in fade-in duration-500">
      {/* Filter & View Mode Bar Area */}
      <ProductFilters
        isFetching={isFetching}
        onRefresh={handleRefresh}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateAction={handleCreate}
      />

      {/* 3. Main Content Content Area */}
      <div className="flex-1 overflow-hidden relative min-h-[400px] flex flex-col border-[0.5px] border-border/40 rounded-sm bg-background/50 shadow-none">
        {isLoading && !isFetching ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 text-foreground/20 animate-spin" />
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {viewMode === 'table' ? (
            <ProductTable
              products={products}
              isLoading={isLoading}
              sortField={params.sortField || 'name'}
              sortOrder={params.sortOrder || 'asc'}
              onSort={handleSort}
              onView={handleViewDetail}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <div className="p-8">
              <ProductGrid
                products={products}
                isLoading={isLoading}
                onView={handleViewDetail}
              />
            </div>
          )}
        </div>

        {/* 4. Pagination (Footer Section) */}
        <div className="border-t border-border/40 bg-background/80 backdrop-blur-md px-6 shrink-0 h-14 flex items-center">
          <StudioPagination
            pagination={pagination || null}
            currentCount={products.length}
            itemName="Sản phẩm"
            onPageChange={(p) => setParams({ page: p })}
          />
        </div>
      </div>

      {/* Overlays Components */}
      <ProductFormOverlay
        isOpen={isFormOpen}
        onClose={closeForm}
        initialData={editingProduct}
        onSubmit={onFormSubmit}
        isLoading={isCreating || isUpdating}
      />

      <ProductDetailOverlay
        product={selectedProduct}
        isOpen={isDetailOpenOverlay}
        onClose={closeDetail}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <StudioConfirmationDialog
        isOpen={confirmDelete.isOpen}
        title="Xác nhận xóa sản phẩm?"
        description="Hành động này sẽ xóa tạm thời sản phẩm, tất cả biến thế (SKU) và các bản ghi tồn kho liên quan. Bạn có thể khôi phục lại trong thùng rác."
        variant="danger"
        onClose={closeDeleteConfirm}
        onConfirm={() => {
          deleteProduct(confirmDelete.id);
          closeDeleteConfirm();
        }}
      />
    </div>
  );
}
