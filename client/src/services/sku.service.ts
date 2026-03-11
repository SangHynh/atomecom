import { api } from '@/lib/axios';
import { z } from 'zod';
import {
  Sku,
  SuccessResponse,
  skuSchema,
  UpdateSkuPriceRequestSchema,
} from '@atomecom/shared';

type UpdateSkuPayload = z.infer<typeof skuSchema> & { version: number };
type UpdateSkuPricePayload = z.infer<
  typeof UpdateSkuPriceRequestSchema.shape.body
> & { version: number };

export const skuService = {
  getSkus: async (filters: Record<string, unknown> = {}) => {
    const response = await api.get<SuccessResponse<Sku[]>>('/skus', {
      params: filters,
    });
    return response.data;
  },

  getSkuById: async (id: string) => {
    const response = await api.get<SuccessResponse<Sku>>(`/skus/${id}`);
    return response.data;
  },

  getSkusByProductId: async (productId: string) => {
    const response = await api.get<SuccessResponse<Sku[]>>(
      `/products/${productId}/skus`,
    );
    return response.data;
  },

  updateSku: async (id: string, data: UpdateSkuPayload) => {
    const response = await api.put<SuccessResponse<Sku>>(
      `/admin/skus/${id}`,
      data,
    );
    return response.data;
  },

  updateSkuPrice: async (id: string, data: UpdateSkuPricePayload) => {
    const response = await api.patch<SuccessResponse<Sku>>(
      `/admin/skus/${id}/price`,
      data,
    );
    return response.data;
  },

  deleteSku: async (id: string) => {
    const response = await api.delete<SuccessResponse<void>>(
      `/admin/skus/${id}`,
    );
    return response.data;
  },
};
