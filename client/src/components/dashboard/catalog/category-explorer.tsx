'use client';

import React, { useState, useMemo } from 'react';
import {
  Folder,
  ChevronRight,
  MoreVertical,
  Eye,
  Image as ImageIcon,
  Layers,
  Search,
  ArrowLeft,
  X,
  Home,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { Category } from '@atomecom/shared';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CategoryCard } from './category-card';

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
  onPageChange?: (page: number) => void;
  searchTerm?: string;
  onSearch?: (term: string) => void;
  currentPath: string | null;
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
  onPageChange,
  searchTerm: externalSearchTerm = '',
  onSearch,
  currentPath,
}: CategoryExplorerProps) {
  const { t } = useTranslation();
  const [localSearchTerm, setLocalSearchTerm] = useState(externalSearchTerm);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverPath, setDragOverPath] = useState<string | null>(null);
  const [isDragOverRoot, setIsDragOverRoot] = useState(false);

  const parentPath = useMemo(() => {
    if (!currentPath) return undefined;
    const parts = currentPath.split(',').filter(Boolean);
    parts.pop();
    return parts.length > 0 ? `,${parts.join(',')},` : null;
  }, [currentPath]);

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

  const filteredCategories = categories;

  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchTerm !== externalSearchTerm) {
        onSearch?.(localSearchTerm);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearch, externalSearchTerm]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search & Navigation Bar (Always visible) */}
      <div className="flex-shrink-0 z-30 bg-slate-50/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-border/40 pb-4 transition-all">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Navigation Path & Breadcrumbs */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Show Back button if we are NOT at root (path exists) */}
            {onNavigate &&
              (localSearchTerm ||
                (breadcrumbs && breadcrumbs.length > 0) ||
                currentParent) && (
                <div className="flex items-center flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onDragOver={(e) => {
                      if (!canMoveCategory || parentPath === undefined) return;
                      handleDragOver(e as any, parentPath);
                    }}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => {
                      if (!canMoveCategory || parentPath === undefined) return;
                      handleDrop(e as any, parentPath);
                    }}
                    onClick={() => {
                      // If searching, back button clears search
                      if (localSearchTerm) {
                        setLocalSearchTerm('');
                        onSearch?.('');
                        return;
                      }

                      // Otherwise navigate up
                      if (currentParent) {
                        const parts = currentParent.path
                          .split(',')
                          .filter(Boolean);
                        parts.pop();
                        const parentPathToNav =
                          parts.length > 0 ? `,${parts.join(',')},` : null;
                        onNavigate(parentPathToNav);
                      } else if (breadcrumbs && breadcrumbs.length > 0) {
                        const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
                        const parts = lastCrumb.path.split(',').filter(Boolean);
                        parts.pop();
                        const parentPathToNav =
                          parts.length > 0 ? `,${parts.join(',')},` : null;
                        onNavigate(parentPathToNav);
                      } else {
                        onNavigate(null);
                      }
                    }}
                    className={cn(
                      'h-9 w-9 p-0 rounded-full hover:bg-muted text-muted-foreground transition-all',
                      draggedId &&
                        dragOverPath === parentPath &&
                        parentPath !== undefined &&
                        'bg-primary/20 text-primary scale-125 ring-2 ring-primary shadow-lg z-20',
                    )}
                    title="Quay lại (Thả vào đây để di chuyển lên cấp trên)"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="h-6 w-[1px] bg-border/40 mx-1"></div>
                </div>
              )}

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth pb-1 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onDragOver={(e) => {
                  if (!canMoveCategory) return;
                  e.preventDefault();
                  setIsDragOverRoot(true);
                }}
                onDragLeave={() => setIsDragOverRoot(false)}
                onDrop={(e) => {
                  if (!canMoveCategory) return;
                  setIsDragOverRoot(false);
                  handleDrop(e as any, null);
                }}
                onClick={() => onNavigate(null)}
                className={cn(
                  'flex-shrink-0 rounded-full h-8 text-[10px] font-black uppercase tracking-widest transition-all gap-1.5',
                  !currentParent
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'text-muted-foreground hover:bg-muted',
                  isDragOverRoot &&
                    'bg-primary text-white scale-110 shadow-xl ring-2 ring-primary/50 z-20',
                )}
              >
                <Home className="h-3.5 w-3.5" />
                {!currentParent &&
                  t('catalog.categories.root', {
                    defaultValue: 'Danh mục Gốc',
                  })}
              </Button>

              {breadcrumbs
                .filter((crumb) => crumb && crumb.path)
                .map((crumb) => (
                  <React.Fragment key={crumb.path}>
                    <ChevronRight className="h-3 w-3 text-muted-foreground opacity-30 flex-shrink-0" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onDragOver={(e) =>
                        canMoveCategory && handleDragOver(e as any, crumb.path)
                      }
                      onDragLeave={handleDragLeave}
                      onDrop={(e) =>
                        canMoveCategory && handleDrop(e as any, crumb.path)
                      }
                      onClick={() => onNavigate(crumb.path)}
                      className={cn(
                        'flex-shrink-0 rounded-full px-4 h-8 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap',
                        currentParent?.path === crumb.path
                          ? 'bg-primary text-white hover:bg-primary/90'
                          : 'text-muted-foreground hover:bg-muted',
                        draggedId &&
                          dragOverPath === crumb.path &&
                          'bg-primary/20 text-primary scale-110 ring-2 ring-primary z-20 shadow-lg',
                      )}
                    >
                      {crumb.name}
                    </Button>
                  </React.Fragment>
                ))}
            </div>
          </div>

          {/* Search and Action area */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-[320px] group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50 group-focus-within:text-primary group-focus-within:opacity-100 transition-all" />
              <Input
                placeholder={t('catalog.categories.search_placeholder', {
                  defaultValue: 'Tìm kiếm danh mục...',
                })}
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                className="pl-10 pr-10 h-10 rounded-xl bg-muted/40 border-border/40 text-[12px] font-bold placeholder:text-[10px] placeholder:font-black placeholder:tracking-[0.05em] transition-all focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50 shadow-none border-dashed group-hover:border-solid"
              />
              {localSearchTerm && (
                <button
                  onClick={() => {
                    setLocalSearchTerm('');
                    onSearch?.('');
                    onNavigate(null);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            {actionNode && (
              <div className="flex-shrink-0 w-full sm:w-auto">{actionNode}</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 py-6 px-4 sm:px-0">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[120px] rounded-2xl border border-border/40 bg-background/50 animate-pulse"
              />
            ))}
          </div>
        ) : filteredCategories.length === 0 && !currentParent ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-6 bg-muted/20 rounded-full mb-4">
              <Folder className="h-12 w-12 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold">Chưa có danh mục nào</h3>
            <p className="text-sm text-muted-foreground max-w-[300px] mt-2">
              Hệ thống đang trống, hãy bắt đầu bằng việc tạo danh mục gốc đầu
              tiên.
            </p>
          </div>
        ) : (
          <>
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                {filteredCategories.map((category) => (
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
            ) : currentParent ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center border-2 border-dashed border-border/40 rounded-[32px] bg-muted/5">
                <Layers className="h-10 w-10 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">
                  Danh mục này trống
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-xl text-[10px] font-black uppercase tracking-widest h-10 px-6"
                  onClick={() => {
                    const parts = currentParent.path.split(',').filter(Boolean);
                    parts.pop();
                    const parentPath =
                      parts.length > 0 ? `,${parts.join(',')},` : null;
                    onNavigate(parentPath);
                  }}
                >
                  Quay lại cấp trên
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center opacity-50">
                <Search className="h-10 w-10 mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">
                  Không tìm thấy kết quả nào
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination Footer (Fixed at bottom) */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex-shrink-0 flex items-center justify-between px-2 py-4 mt-auto border-t border-border/40 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
            {t('common.displaying_items', {
              count: filteredCategories.length,
              total: pagination.totalElements,
              defaultValue: `Hiển thị ${filteredCategories.length} / ${pagination.totalElements}`,
            })}
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border/40"
              disabled={pagination.currentPage <= 1}
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-[10px] font-black px-3 uppercase tracking-widest">
              {t('common.pagination_page', {
                current: pagination.currentPage,
                total: pagination.totalPages,
                defaultValue: `Trang ${pagination.currentPage} / ${pagination.totalPages}`,
              })}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-border/40"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
