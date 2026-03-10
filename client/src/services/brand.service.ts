import { api } from '@/lib/axios';
import { Brand, SuccessResponse, PaginatedResult } from '@atomecom/shared';

export interface BrandFilter {
  keyword?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const brandService = {
  getBrands: async (filters: BrandFilter = {}) => {
    const response = await api.get<SuccessResponse<Brand[]>>('/brands', {
      params: filters,
    });
    return response.data;
  },

  getBrandById: async (id: string) => {
    const response = await api.get<SuccessResponse<Brand>>(`/brands/${id}`);
    return response.data;
  },

  createBrand: async (data: Partial<Brand>) => {
    const response = await api.post<SuccessResponse<Brand>>(
      '/admin/brands',
      data,
    );
    return response.data;
  },

  updateBrand: async (id: string, data: Partial<Brand>) => {
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
