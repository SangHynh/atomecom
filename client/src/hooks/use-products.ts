'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { z } from 'zod';
import { productService } from '@/services/product.service';
import { SuccessResponse, Product, productFormSchema } from '@atomecom/shared';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

type CreateProductPayload = z.infer<typeof productFormSchema>;
type UpdateProductPayload = z.infer<typeof productFormSchema> & {
  version: number;
};

export const useProducts = (filters: Record<string, unknown> = {}) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const productsQuery = useQuery({
    queryKey: ['products', filters],
    placeholderData: (previousData) => previousData,
    queryFn: () => productService.getProducts(filters),
  });

  const createProductMutation = useMutation({
    mutationFn: (data: CreateProductPayload) =>
      productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(
        t('catalog.products.actions.created_success', {
          defaultValue: 'Product created successfully',
        }),
      );
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ||
          t('catalog.products.actions.created_failed', {
            defaultValue: 'Failed to create product',
          }),
      );
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
      productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(
        t('catalog.products.actions.updated_success', {
          defaultValue: 'Product updated successfully',
        }),
      );
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ||
          t('catalog.products.actions.updated_failed', {
            defaultValue: 'Failed to update product',
          }),
      );
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['products', filters] });
      const previousProducts = queryClient.getQueryData(['products', filters]);

      queryClient.setQueryData(
        ['products', filters],
        (old: SuccessResponse<Product[]> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.filter((p) => p.id !== id),
          };
        },
      );

      return { previousProducts };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(
        t('catalog.products.actions.deleted_success', {
          defaultValue: 'Product deleted successfully',
        }),
      );
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ||
          t('catalog.products.actions.deleted_failed', {
            defaultValue: 'Failed to delete product',
          }),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    products: productsQuery.data?.data || [],
    pagination: productsQuery.data?.metadata?.pagination
      ? {
          totalElements: productsQuery.data.metadata.pagination.total_items,
          totalPages: productsQuery.data.metadata.pagination.total_pages,
          currentPage: productsQuery.data.metadata.pagination.page,
          elementsPerPage: productsQuery.data.metadata.pagination.limit,
        }
      : {
          totalElements: 0,
          totalPages: 0,
          currentPage: 1,
          elementsPerPage: 10,
        },
    isLoading: productsQuery.isLoading,
    isFetching: productsQuery.isFetching,
    isError: productsQuery.isError,
    createProduct: createProductMutation.mutate,
    createProductAsync: createProductMutation.mutateAsync,
    isCreating: createProductMutation.isPending,
    updateProduct: updateProductMutation.mutate,
    updateProductAsync: updateProductMutation.mutateAsync,
    isUpdating: updateProductMutation.isPending,
    deleteProduct: deleteProductMutation.mutate,
    deleteProductAsync: deleteProductMutation.mutateAsync,
  };
};

export const useProduct = (id: string | null) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => (id ? productService.getProductById(id) : null),
    enabled: !!id,
  });
};
