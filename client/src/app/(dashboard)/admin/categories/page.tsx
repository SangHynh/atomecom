'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { CategoryExplorer } from '@/components/dashboard/catalog/category/explorer/category-explorer';
import { CategoryDetailOverlay } from '@/components/dashboard/catalog/category/overlays/details/category-detail-overlay';
import { CategoryFormOverlay } from '@/components/dashboard/catalog/category/overlays/form/category-form-overlay';
import {
  useCategories,
  useCategoryAncestors,
} from '@/hooks/use-categories';
import { useStudioManager } from '@/hooks/use-studio-manager';
import { Button } from '@/components/ui/button';
import { useConfirmation } from '@/components/dashboard/studio/studio-confirmation-provider';
import { Category } from '@atomecom/shared';
import { useTableParams } from '@/hooks/use-table-params';
import { extractData } from '@/lib/api-utils';

export default function CategoriesPage() {
  // ─── Table & URL State ─────────────────────────────────────
  const { params, setParams } = useTableParams({
    limit: 50,
  });

  const currentPath = (params.path as string) || null;
  const searchTerm = params.q || '';

  const {
    selectedId: selectedCategoryId,
    editingId: editingCategoryId,
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
    categories,
    pagination,
    isLoading,
    createCategory,
    createCategoryAsync,
    isCreating,
    updateCategory,
    updateCategoryAsync,
    isUpdating,
    moveCategory,
    deleteCategory,
  } = useCategories({
    path: currentPath,
    level: !currentPath && !searchTerm ? 1 : undefined,
    limit: 50,
    page: params.page,
    keyword: searchTerm || undefined,
  });

  const { data: ancestorsInfo } = useCategoryAncestors(currentPath);
  const ancestors = (extractData(ancestorsInfo) as Category[]) || [];
  const parent = ancestors.length > 0 ? ancestors[ancestors.length - 1] : null;

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || null;
  const editingCategory = categories.find((c) => c.id === editingCategoryId) || null;

  // ─── Handlers ──────────────────────────────────────────────
  const extraBreadcrumbs = useMemo(() => {
    return ancestors.map((anc: Category, index: number) => ({
      label: anc.name,
      href: '#',
      active: index === ancestors.length - 1 && !searchTerm,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        handleNavigate(anc.path);
      },
    }));
  }, [ancestors, searchTerm]);

  const handleNavigate = (newPath: string | null) => {
    setParams({ path: newPath || undefined, page: 1 });
  };

  const onFormSubmit = async (data: any) => {
    const finalData = editingCategory
      ? { ...data, version: editingCategory.version }
      : { ...data, parentId: parent?.id || null };

    if (editingCategory) {
      await updateCategoryAsync({ id: editingCategory.id, data: finalData }).then(
        () => {
          closeForm();
        },
      );
    } else {
      await createCategoryAsync(finalData).then(() => {
        closeForm();
      });
    }
  };

  const handleMoveCategory = (
    categoryId: string,
    targetPath: string | null,
  ) => {
    const categoryToMove = categories.find((c) => c.id === categoryId);
    if (!categoryToMove || categoryToMove.path === targetPath) return;

    confirm({
      title: 'Di chuyển danh mục?',
      description: 'Việc thay đổi cấu trúc danh mục sẽ ảnh hưởng đến phân cấp sản phẩm và đường dẫn SEO.',
      variant: 'warning',
      onConfirm: async () => {
        const targetCategory = targetPath
          ? categories.find((c) => c.path === targetPath)
          : null;
        const parentId = targetPath ? targetCategory?.id || null : null;

        await moveCategory({
          id: categoryId,
          data: { parentId, version: categoryToMove.version },
        });
      },
    });
  };



  // ─── Render ────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col p-6 md:p-8 bg-background relative animate-in fade-in duration-500 overflow-hidden">
      {/* Explorer Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <CategoryExplorer
          categories={categories}
          isLoading={isLoading}
          onView={(cat) => openDetail(cat.id)}
          onNavigate={handleNavigate}
          currentParent={parent || null}
          currentPath={currentPath}
          breadcrumbs={ancestors}
          onMoveCategory={handleMoveCategory}
          canMoveCategory={true}
          pagination={pagination}
          onAddAction={() => openForm(null)}
        />
      </div>

      <CategoryDetailOverlay
        category={selectedCategory}
        isOpen={isDetailOpenOverlay}
        onClose={closeDetail}
        onDelete={(id) => {
          confirm({
            title: 'Xác nhận xóa danh mục?',
            description: 'Toàn bộ thông tin và các danh mục con bên trong cũng sẽ bị gỡ bỏ.',
            variant: 'danger',
            onConfirm: async () => {
              await deleteCategory(id);
              closeDetail();
            },
          });
        }}
        onUpdate={(id: string, data: any, onSuccess: () => void) => {
          updateCategory({ id, data }, { onSuccess });
        }}
        isUpdating={isUpdating}
      />

      <CategoryFormOverlay
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={onFormSubmit}
        isLoading={isCreating}
        category={editingCategory}
      />


    </div>
  );
}
