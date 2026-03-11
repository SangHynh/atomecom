'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { z } from 'zod';
import { skuService } from '@/services/sku.service';
import {
  Sku,
  SuccessResponse,
  skuSchema,
  UpdateSkuPriceRequestSchema,
} from '@atomecom/shared';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

type UpdateSkuPayload = z.infer<typeof skuSchema> & { version: number };
type UpdateSkuPricePayload = z.infer<
  typeof UpdateSkuPriceRequestSchema.shape.body
> & { version: number };

export const useSkus = (filters: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: ['skus', filters],
    queryFn: () => skuService.getSkus(filters),
  });
};

export const useSkusByProduct = (productId: string | null) => {
  return useQuery({
    queryKey: ['skus', productId],
    queryFn: () =>
      productId ? skuService.getSkusByProductId(productId) : null,
    enabled: !!productId,
  });
};

export const useSku = (id: string | null) => {
  return useQuery({
    queryKey: ['sku', id],
    queryFn: () => (id ? skuService.getSkuById(id) : null),
    enabled: !!id,
  });
};

export const useSkuMutations = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const updateSkuMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSkuPayload }) =>
      skuService.updateSku(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skus'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(
        t('catalog.skus.actions.updated_success', {
          defaultValue: 'SKU updated successfully',
        }),
      );
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ||
          t('catalog.skus.actions.updated_failed', {
            defaultValue: 'Failed to update SKU',
          }),
      );
    },
  });

  const updateSkuPriceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSkuPricePayload }) =>
      skuService.updateSkuPrice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skus'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(
        t('catalog.skus.actions.price_updated_success', {
          defaultValue: 'Price updated successfully',
        }),
      );
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ||
          t('catalog.skus.actions.price_updated_failed', {
            defaultValue: 'Failed to update price',
          }),
      );
    },
  });

  const deleteSkuMutation = useMutation({
    mutationFn: (id: string) => skuService.deleteSku(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skus'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(
        t('catalog.skus.actions.deleted_success', {
          defaultValue: 'SKU deleted successfully',
        }),
      );
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ||
          t('catalog.skus.actions.deleted_failed', {
            defaultValue: 'Failed to delete SKU',
          }),
      );
    },
  });

  return {
    updateSku: updateSkuMutation.mutate,
    updateSkuAsync: updateSkuMutation.mutateAsync,
    isUpdatingSku: updateSkuMutation.isPending,
    updateSkuPrice: updateSkuPriceMutation.mutate,
    updateSkuPriceAsync: updateSkuPriceMutation.mutateAsync,
    isUpdatingPrice: updateSkuPriceMutation.isPending,
    deleteSku: deleteSkuMutation.mutate,
    deleteSkuAsync: deleteSkuMutation.mutateAsync,
  };
};
