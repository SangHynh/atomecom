'use client';

import React, { useState } from 'react';
import {
  Folder,
  ChevronRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Plus,
} from 'lucide-react';
import { Category } from '@atomecom/shared';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CategoryCard } from './category-card';
import { StudioSearchInput } from '@/components/dashboard/studio/studio-search-input';
import { StudioEmptyState } from '@/components/dashboard/studio/studio-empty-state';
import { useTableParams } from '@/hooks/use-table-params';
import { StudioPagination } from '@/components/dashboard/studio/studio-pagination';

interface CategoryExplorerProps {
  categories: Category[];
  isLoading: boolean;
  onView: (category: Category) => void;
  onNavigate: (path: string | null) => void;
  currentParent: Category | null;
  breadcrumbs: Category[];
  actionNode?: React.ReactNode;
  onMoveCategory?: (categoryId: string, targetPath: string | null) => void;
  canMoveCategory?: boolean;
  pagination?: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    elementsPerPage: number;
  };
  currentPath: string | null;
  onAddAction?: () => void;
}

export function CategoryExplorer({
  categories,
  isLoading,
  onView,
  onNavigate,
  currentParent,
  breadcrumbs,
  actionNode,
  onMoveCategory,
  canMoveCategory = false,
  pagination,
  currentPath: _currentPath,
  onAddAction,
}: CategoryExplorerProps) {
  const { params, setParams } = useTableParams();
  const searchTerm = params.q || '';
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverPath, setDragOverPath] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.stopPropagation();
    e.dataTransfer.setData('categoryId', id);
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, path: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    if (path !== dragOverPath) setDragOverPath(path);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPath(null);
  };

  const handleDrop = (e: React.DragEvent, targetPath: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverPath(null);
    const id = e.dataTransfer.getData('categoryId');
    if (id && onMoveCategory) {
      onMoveCategory(id, targetPath);
    }
    setDraggedId(null);
  };

  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== searchTerm) {
        setParams({ q: localSearchTerm || undefined, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchTerm, searchTerm, setParams]);

  return (
    <div className="flex flex-col h-full bg-background selection:bg-primary/10">
      {/* Navigation & Search Bar */}
      <div className="flex-shrink-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/10 pb-6 pt-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 px-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {(localSearchTerm ||
              (breadcrumbs && breadcrumbs.length > 0) ||
              currentParent) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-[var(--radius)] hover:bg-muted/10 border-[0.5px] border-border/20 shrink-0 shadow-sm"
                onClick={() => {
                  if (localSearchTerm) {
                    setLocalSearchTerm('');
                    setParams({ q: undefined, page: 1 });
                    return;
                  }
                  if (currentParent) {
                    const parts = currentParent.path.split(',').filter(Boolean);
                    parts.pop();
                    onNavigate(
                      parts.length > 0 ? `,${parts.join(',')},` : null,
                    );
                  } else {
                    onNavigate(null);
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 text-muted-foreground/40" />
              </Button>
            )}

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(null)}
                className={cn(
                  'font-semibold text-lg tracking-tight rounded-[var(--radius)] px-4 h-10 transition-all shrink-0',
                  !currentParent
                    ? 'text-foreground'
                    : 'text-muted-foreground/30 hover:text-foreground',
                )}
              >
                Gốc (Root)
              </Button>

              {breadcrumbs.filter(Boolean).map((crumb) => (
                <React.Fragment key={crumb.path}>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/20 shrink-0" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate(crumb.path)}
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider rounded-[var(--radius)] px-4 h-9 transition-all shrink-0',
                      currentParent?.path === crumb.path
                        ? 'bg-muted/10 text-foreground border border-border/10'
                        : 'text-muted-foreground/40 hover:text-foreground',
                    )}
                  >
                    {crumb.name}
                  </Button>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <StudioSearchInput
              placeholder="Tìm kiếm phân loại hàng hóa định danh..."
              value={localSearchTerm}
              onChange={setLocalSearchTerm}
              containerClassName="w-full sm:w-[400px]"
            />
            {onAddAction && (
              <Button
                onClick={onAddAction}
                className="h-11 px-6 rounded-[var(--radius)] bg-foreground text-background hover:bg-foreground/90 font-bold text-[10px] uppercase tracking-wide gap-2 shrink-0 shadow-none border border-foreground/10"
              >
                <Plus className="h-4 w-4" />
                Thêm danh mục
              </Button>
            )}
            {actionNode}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 py-8 px-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-60 rounded-[var(--radius)] border-[0.5px] border-border/20 bg-muted/5 animate-pulse"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <StudioEmptyState
            icon={Folder}
            title="Kho lưu trữ trống"
            description="Bắt đầu xây dựng cấu trúc hàng hóa của bạn bằng cách khởi tạo danh mục gốc."
            actionLabel={currentParent ? 'Quay lại danh mục gốc' : undefined}
            onAction={currentParent ? () => onNavigate(null) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 animate-in fade-in duration-1000">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onView={onView}
                onNavigate={onNavigate}
                draggedId={draggedId}
                dragOverPath={dragOverPath}
                canMoveCategory={canMoveCategory}
                onDragStart={handleDragStart}
                onDragEnd={() => setDraggedId(null)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}
      </div>

      <StudioPagination
        pagination={
          pagination
            ? {
                currentPage: pagination.currentPage,
                totalPages: pagination.totalPages,
                totalElements: pagination.totalElements,
              }
            : null
        }
        currentCount={categories.length}
        itemName="Danh mục"
        onPageChange={(p) => setParams({ page: p })}
      />
    </div>
  );
}





