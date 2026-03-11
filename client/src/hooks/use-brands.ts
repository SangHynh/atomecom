'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { z } from 'zod';
import { brandService } from '@/services/brand.service';
import { Brand, SuccessResponse, brandSchema } from '@atomecom/shared';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

type CreateBrandPayload = z.infer<typeof brandSchema>;
type UpdateBrandPayload = CreateBrandPayload & { version: number };

export const useBrands = (filters: Record<string, unknown> = {}) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const brandsQuery = useQuery({
    queryKey: ['brands', filters],
    queryFn: () => brandService.getBrands(filters),
  });

  const createBrandMutation = useMutation({
    mutationFn: (data: CreateBrandPayload) => brandService.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success(
        t('catalog.brands.actions.created_success', {
          defaultValue: 'Brand created successfully',
        }),
      );
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ||
          t('catalog.brands.actions.created_failed', {
            defaultValue: 'Failed to create brand',
          }),
      );
    },
  });

  const updateBrandMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandPayload }) =>
      brandService.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success(
        t('catalog.brands.actions.updated_success', {
          defaultValue: 'Brand updated successfully',
        }),
      );
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ||
          t('catalog.brands.actions.updated_failed', {
            defaultValue: 'Failed to update brand',
          }),
      );
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (id: string) => brandService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success(
        t('catalog.brands.actions.deleted_success', {
          defaultValue: 'Brand deleted successfully',
        }),
      );
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ||
          t('catalog.brands.actions.deleted_failed', {
            defaultValue: 'Failed to delete brand',
          }),
      );
    },
  });

  return {
    brands: brandsQuery.data?.data || [],
    pagination: brandsQuery.data?.metadata?.pagination
      ? {
          totalElements: brandsQuery.data.metadata.pagination.total_items,
          totalPages: brandsQuery.data.metadata.pagination.total_pages,
          currentPage: brandsQuery.data.metadata.pagination.page,
          elementsPerPage: brandsQuery.data.metadata.pagination.limit,
        }
      : {
          totalElements: 0,
          totalPages: 0,
          currentPage: 1,
          elementsPerPage: 10,
        },
    isLoading: brandsQuery.isLoading,
    isFetching: brandsQuery.isFetching,
    isError: brandsQuery.isError,
    createBrand: createBrandMutation.mutate,
    isCreating: createBrandMutation.isPending,
    updateBrand: updateBrandMutation.mutate,
    updateBrandAsync: updateBrandMutation.mutateAsync,
    isUpdating: updateBrandMutation.isPending,
    deleteBrand: deleteBrandMutation.mutate,
    deleteBrandAsync: deleteBrandMutation.mutateAsync,
  };
};

export const useBrand = (id: string | null) => {
  return useQuery({
    queryKey: ['brand', id],
    queryFn: () => (id ? brandService.getBrandById(id) : null),
    enabled: !!id,
  });
};
