'use client';

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderTree, Plus, Loader2, ListTree } from 'lucide-react';
import { CategoryExplorer } from '@/components/dashboard/catalog/category-explorer';
import { CategoryDetailOverlay } from '@/components/dashboard/catalog/category-detail-overlay';
import { CategoryFormOverlay } from '@/components/dashboard/catalog/category-form-overlay';
import {
  useCategories,
  useCategory,
  useCategoryAncestors,
} from '@/hooks/use-categories';
import { useStudioManager } from '@/hooks/use-studio-manager';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/dashboard/confirmation-dialog';
import { Breadcrumbs } from '@/components/dashboard/breadcrumbs';
import { Category } from '@atomecom/shared';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import { cn } from '@/lib/utils';

export default function CategoriesPage() {
  const { t } = useTranslation();

  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    selectedId: selectedCategoryId,
    editingId: editingCategoryId,
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

  const [confirmMove, setConfirmMove] = useState<{
    isOpen: boolean;
    categoryId: string;
    targetPath: string | null;
  }>({ isOpen: false, categoryId: '', targetPath: null });

  // Data fetching
  const {
    categories,
    pagination,
    isLoading,
    createCategory,
    isCreating,
    updateCategory,
    isUpdating,
    moveCategory,
    deleteCategory,
  } = useCategories({
    path: currentPath,
    level: !currentPath && !searchTerm ? 1 : undefined,
    limit: 50,
    page: page,
    keyword: searchTerm || undefined,
  });

  const { data: ancestorsInfo } = useCategoryAncestors(currentPath);
  const ancestors = (ancestorsInfo as any)?.data || [];
  const parent = ancestors.length > 0 ? ancestors[ancestors.length - 1] : null;

  // Detail & Editing queries
  const { data: selectedCategoryInfo } = useCategory(selectedCategoryId);
  const selectedCategory = (selectedCategoryInfo as any)?.data || null;

  const { data: editingCategoryInfo } = useCategory(editingCategoryId);
  const editingCategory = (editingCategoryInfo as any)?.data || null;

  // Sync Global Breadcrumbs
  const extraBreadcrumbs = useMemo(() => {
    return ancestors.map((anc: Category, index: number) => ({
      label: anc.name,
      href: '#', // We handle navigation via handleNavigate internally, or we could set proper URLs
      active: index === ancestors.length - 1 && !searchTerm,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        handleNavigate(anc.path);
      },
    }));
  }, [ancestors, searchTerm]);

  const handleNavigate = (newPath: string | null) => {
    setPage(1); // Reset page when navigating
    if (newPath === null) {
      setCurrentPath(null);
      return;
    }

    setCurrentPath(newPath);
  };

  const handleCreate = () => openForm(null);
  const handleDelete = (id: string) => openDeleteConfirm(id);

  const handleMoveCategory = (
    categoryId: string,
    targetPath: string | null,
  ) => {
    const categoryToMove = categories.find((c) => c.id === categoryId);
    if (!categoryToMove) return;

    // Nếu di chuyển vào chính nó hoặc cha hiện tại thì bỏ qua
    if (categoryToMove.path === targetPath) return;

    setConfirmMove({ isOpen: true, categoryId, targetPath });
  };

  const executeMove = () => {
    const { categoryId, targetPath } = confirmMove;
    const categoryToMove = categories.find((c) => c.id === categoryId);
    if (!categoryToMove) return;

    moveCategory({
      id: categoryId,
      data: {
        parentPath: targetPath,
        version: categoryToMove.version,
      },
    });
    setConfirmMove({ isOpen: false, categoryId: '', targetPath: null });
  };

  const handleViewDetail = (category: Category) => openDetail(category.id);

  const onFormSubmit = (data: any) => {
    // If creating, automatically set the parentPath to current view's path
    const finalData = editingCategory
      ? { ...data, version: editingCategory.version }
      : { ...data, parentPath: currentPath };

    if (editingCategory) {
      updateCategory(
        { id: editingCategory.id, data: finalData },
        { onSuccess: closeForm },
      );
    } else {
      createCategory(finalData, {
        onSuccess: closeForm,
      });
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden bg-slate-50/30 dark:bg-zinc-950/30 relative">
      <Breadcrumbs extraItems={extraBreadcrumbs as any} />

      {/* Explorer Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CategoryExplorer
          categories={categories}
          isLoading={isLoading}
          onView={handleViewDetail}
          onNavigate={handleNavigate}
          currentParent={parent || null}
          currentPath={currentPath}
          breadcrumbs={ancestors}
          onMoveCategory={handleMoveCategory}
          canMoveCategory={true}
          pagination={pagination}
          onPageChange={setPage}
          searchTerm={searchTerm}
          onSearch={(term) => {
            setSearchTerm(term);
            setPage(1); // Reset page on new search
          }}
          actionNode={
            <Button
              onClick={handleCreate}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl px-4 h-11 shadow-lg shadow-primary/20 transition-all active:scale-95 gap-2 font-black uppercase tracking-widest text-[10px]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Thêm Danh mục mới</span>
            </Button>
          }
        />
      </div>

      <CategoryDetailOverlay
        category={selectedCategory}
        isOpen={isDetailOpenOverlay}
        onClose={closeDetail}
        onDelete={handleDelete}
        onUpdate={(id: string, data: any, onSuccess: () => void) => {
          updateCategory({ id, data }, { onSuccess });
        }}
        isUpdating={isUpdating}
      />

      {/* Create Overlay (Premium) */}
      <CategoryFormOverlay
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={onFormSubmit}
        isLoading={isCreating}
        parent={parent}
        category={editingCategory}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={confirmDelete.isOpen}
        title="Xác nhận xóa danh mục?"
        description="Hành động này không thể hoàn tác. Toàn bộ thông tin và các danh mục con bên trong cũng có thể bị ảnh hưởng."
        variant="danger"
        onClose={closeDeleteConfirm}
        onConfirm={() => {
          deleteCategory(confirmDelete.id);
          closeDeleteConfirm();
        }}
      />

      {/* Move Confirmation */}
      <ConfirmationDialog
        isOpen={confirmMove.isOpen}
        title="Xác nhận di chuyển danh mục?"
        description={
          <div className="space-y-3">
            <p>
              Việc di chuyển danh mục có thể ảnh hưởng đến thứ tự hiển thị và
              cấu trúc URL SEO.
            </p>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-[11px] text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider mb-1">
                Lưu ý quan trọng
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Nếu danh mục này có nhiều danh mục con, hệ thống sẽ phải cập
                nhật hàng loạt đường dẫn (Materialized Path), điều này có thể
                tiêu tốn tài nguyên. Nếu bạn đang thay đổi cơ cấu lớn, hãy cân
                nhắc <strong>Xóa & Tạo mới</strong> hoặc chỉ{' '}
                <strong>Đổi tên</strong>.
              </p>
            </div>
            <p className="font-bold">Bạn có chắc chắn muốn tiếp tục?</p>
          </div>
        }
        variant="warning"
        onClose={() =>
          setConfirmMove({ isOpen: false, categoryId: '', targetPath: null })
        }
        onConfirm={executeMove}
      />
    </div>
  );
}
