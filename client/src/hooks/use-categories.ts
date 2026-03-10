'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, CategoryFilter } from '@/services/category.service';
import { Category } from '@atomecom/shared';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const useCategories = (filters: CategoryFilter = {}) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const categoriesQuery = useQuery({
    queryKey: ['categories', filters],
    placeholderData: (previousData) => previousData,
    queryFn: () => {
      // In Admin/System use cases where limit is provided or keyword is present, always use standard list view.
      // Discovery tree is optimized for Customer Menu view only.
      if (filters && (filters.limit || filters.keyword)) {
        // If searching by keyword, we search globally (no path)
        const effectiveFilters = filters.keyword
          ? { ...filters, path: undefined }
          : filters;
        return categoryService.getCategories(effectiveFilters);
      }

      return filters.path === undefined &&
        (filters.level === 1 || filters.level === 0)
        ? categoryService.getDiscoveryTree()
        : categoryService.getCategories(filters);
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data: Partial<Category>) =>
      categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(
        t('catalog.categories.actions.created_success', {
          defaultValue: 'Category created successfully',
        }),
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          t('catalog.categories.actions.created_failed', {
            defaultValue: 'Failed to create category',
          }),
      );
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(
        t('catalog.categories.actions.updated_success', {
          defaultValue: 'Category updated successfully',
        }),
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          t('catalog.categories.actions.updated_failed', {
            defaultValue: 'Failed to update category',
          }),
      );
    },
  });

  const moveCategoryMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { parentPath: string | null; version: number };
    }) => categoryService.moveCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(
        t('catalog.categories.actions.moved_success', {
          defaultValue: 'Category moved successfully',
        }),
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          t('catalog.categories.actions.moved_failed', {
            defaultValue: 'Failed to move category',
          }),
      );
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(
        t('catalog.categories.actions.deleted_success', {
          defaultValue: 'Category deleted successfully',
        }),
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          t('catalog.categories.actions.deleted_failed', {
            defaultValue: 'Failed to delete category',
          }),
      );
    },
  });

  return {
    categories: categoriesQuery.data?.data || [],
    pagination: categoriesQuery.data?.metadata?.pagination
      ? {
          totalElements: categoriesQuery.data.metadata.pagination.total_items,
          totalPages: categoriesQuery.data.metadata.pagination.total_pages,
          currentPage: categoriesQuery.data.metadata.pagination.page,
          elementsPerPage: categoriesQuery.data.metadata.pagination.limit,
        }
      : {
          totalElements: 0,
          totalPages: 0,
          currentPage: 1,
          elementsPerPage: 10,
        },
    isLoading: categoriesQuery.isLoading,
    isFetching: categoriesQuery.isFetching,
    isError: categoriesQuery.isError,
    createCategory: createCategoryMutation.mutate,
    isCreating: createCategoryMutation.isPending,
    updateCategory: updateCategoryMutation.mutate,
    updateCategoryAsync: updateCategoryMutation.mutateAsync,
    isUpdating: updateCategoryMutation.isPending,
    moveCategory: moveCategoryMutation.mutate,
    moveCategoryAsync: moveCategoryMutation.mutateAsync,
    isMoving: moveCategoryMutation.isPending,
    deleteCategory: deleteCategoryMutation.mutate,
    deleteCategoryAsync: deleteCategoryMutation.mutateAsync,
  };
};

export const useCategory = (id: string | null) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => (id ? categoryService.getCategoryById(id) : null),
    enabled: !!id,
  });
};

export const useCategoryAncestors = (path: string | null) => {
  return useQuery({
    queryKey: ['category-ancestors', path],
    queryFn: () => (path ? categoryService.getAncestors(path) : null),
    enabled: !!path,
  });
};
