'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tags,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useBrands, useBrand } from '@/hooks/use-brands';
import { useStudioManager } from '@/hooks/use-studio-manager';
import { BrandTable } from '@/components/dashboard/catalog/brand-table';
import { BrandGrid } from '@/components/dashboard/catalog/brand-grid';
import { BrandDetailOverlay } from '@/components/dashboard/catalog/brand-detail-overlay';
import { BrandForm } from '@/components/dashboard/catalog/brand-form';
import { BrandFormOverlay } from '@/components/dashboard/catalog/brand-form-overlay';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/dashboard/confirmation-dialog';
import { Breadcrumbs } from '@/components/dashboard/breadcrumbs';
import { Brand } from '@atomecom/shared';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';

export default function BrandsPage() {
  const { t } = useTranslation();

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
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

  // Data fetching
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
    page,
    limit,
    sortBy: sortField,
    sortOrder,
  });

  const { data: selectedBrandInfo } = useBrand(selectedBrandId);
  const selectedBrand = (selectedBrandInfo as any)?.data || null;

  const { data: editingBrandInfo } = useBrand(editingBrandId);
  const editingBrand = (editingBrandInfo as any)?.data || null;

  const handleCreate = () => openForm(null);
  const handleEdit = (brand: Brand) => openForm(brand.id);
  const handleDelete = (id: string) => openDeleteConfirm(id);
  const handleViewDetail = (brand: Brand) => openDetail(brand.id);

  const onFormSubmit = (data: any) => {
    if (editingBrand) {
      updateBrand(
        { id: editingBrand.id, data },
        {
          onSuccess: closeForm,
        },
      );
    } else {
      createBrand(data, {
        onSuccess: closeForm,
      });
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderPagination = () => {
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
      <div className="flex items-center px-5 py-3 border-t border-border/30 bg-muted/10 backdrop-blur-sm z-20">
        <div className="flex-1 hidden md:flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-foreground/80">
          <span className="text-primary">{brands.length}</span>
          <span className="text-muted-foreground/60 font-medium lowercase italic px-0.5">
            {t('users.table.pagination.of', { defaultValue: 'of' })}
          </span>
          <span className="text-primary">{pagination.totalElements}</span>
          <span className="ml-1 text-muted-foreground/80">
            {t('catalog.brands.title')}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-1 md:flex-none justify-center">
          <Button
            variant="outline"
            size="icon"
            disabled={current <= 1}
            onClick={() => setPage(1)}
            className="h-8 w-8 rounded-lg border-border/40 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-20 shadow-sm"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
            className="h-8 w-8 rounded-lg border-border/40 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-20 shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1 mx-1">
            {pages.map((p, i) =>
              p === '...' ? (
                <span
                  key={`sep-${i}`}
                  className="text-[10px] font-bold text-muted-foreground/30 px-1"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={`page-${p}`}
                  variant={current === p ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setPage(p as number)}
                  className={cn(
                    'h-8 w-8 rounded-lg text-xs font-black transition-all shadow-sm',
                    current === p
                      ? 'bg-primary text-white shadow-lg shadow-primary/25 border-none'
                      : 'border-border/40 hover:bg-primary/10 hover:text-primary',
                  )}
                >
                  {p}
                </Button>
              ),
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            disabled={current >= total}
            onClick={() => setPage(current + 1)}
            className="h-8 w-8 rounded-lg border-border/40 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-20 shadow-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={current >= total}
            onClick={() => setPage(total)}
            className="h-8 w-8 rounded-lg border-border/40 hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-20 shadow-sm"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 hidden md:block" />
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden bg-slate-50/30 dark:bg-zinc-950/30 relative">
      <Breadcrumbs />

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 group sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors z-10" />
          <Input
            placeholder={t('users.page.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 border-border/40 bg-background/50 backdrop-blur-sm rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all font-medium text-sm"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-xl border-border/40 bg-background/50 transition-all"
          onClick={() => {
            setSearchQuery('');
            setPage(1);
          }}
        >
          <RefreshCw
            className={cn(
              'h-4 w-4 text-muted-foreground',
              isFetching && 'animate-spin',
            )}
          />
        </Button>

        <div className="flex items-center gap-1 bg-background/50 backdrop-blur-sm border border-border/40 p-1 rounded-xl h-10">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            className={cn(
              'h-8 w-8 rounded-lg transition-all',
              viewMode === 'grid'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-muted-foreground',
            )}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="icon"
            className={cn(
              'h-8 w-8 rounded-lg transition-all',
              viewMode === 'table'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-muted-foreground',
            )}
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={handleCreate}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl px-4 h-10 shadow-lg shadow-primary/20 transition-all active:scale-95 gap-2 font-black uppercase tracking-widest text-[10px] ml-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">
            {t('catalog.brands.new_brand')}
          </span>
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative min-h-0 flex flex-col rounded-2xl border border-border/40 bg-background/40 backdrop-blur-md ring-1 ring-border/20 shadow-2xl">
        {isLoading ? (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/10 backdrop-blur-[2px]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
          {viewMode === 'table' ? (
            <BrandTable
              brands={brands}
              isLoading={isLoading}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <div className="p-4">
              <BrandGrid
                brands={brands}
                isLoading={isLoading}
                onView={handleViewDetail}
              />
            </div>
          )}
        </div>

        {/* Global Sticky Pagination */}
        {renderPagination()}
      </div>

      {/* Modals */}
      <BrandFormOverlay
        isOpen={isFormOpen}
        onClose={closeForm}
        initialData={editingBrand}
        onSubmit={onFormSubmit}
        isLoading={isCreating || isUpdating}
      />

      <ConfirmationDialog
        isOpen={confirmDelete.isOpen}
        title={t('catalog.brands.actions.delete_confirm')}
        description={t('catalog.brands.actions.delete_confirm')}
        variant="danger"
        onClose={closeDeleteConfirm}
        onConfirm={() => {
          deleteBrand(confirmDelete.id);
          closeDeleteConfirm();
        }}
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
