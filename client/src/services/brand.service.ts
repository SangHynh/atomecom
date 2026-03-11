import { api } from '@/lib/axios';
import { z } from 'zod';
import { Brand, SuccessResponse, brandSchema } from '@atomecom/shared';

type CreateBrandPayload = z.infer<typeof brandSchema>;
type UpdateBrandPayload = z.infer<typeof brandSchema> & { version: number };

export const brandService = {
  getBrands: async (filters: Record<string, unknown> = {}) => {
    const response = await api.get<SuccessResponse<Brand[]>>('/brands', {
      params: filters,
    });
    return response.data;
  },

  getBrandById: async (id: string) => {
    const response = await api.get<SuccessResponse<Brand>>(`/brands/${id}`);
    return response.data;
  },

  createBrand: async (data: CreateBrandPayload) => {
    const response = await api.post<SuccessResponse<Brand>>(
      '/admin/brands',
      data,
    );
    return response.data;
  },

  updateBrand: async (id: string, data: UpdateBrandPayload) => {
    const response = await api.put<SuccessResponse<Brand>>(
      `/admin/brands/${id}`,
      data,
    );
    return response.data;
  },

  deleteBrand: async (id: string) => {
    const response = await api.delete<SuccessResponse<void>>(
      `/admin/brands/${id}`,
    );
    return response.data;
  },
};
