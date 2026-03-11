import { api } from '@/lib/axios';
import { z } from 'zod';
import { Category, SuccessResponse, categorySchema } from '@atomecom/shared';

type CreateCategoryPayload = z.infer<typeof categorySchema>;
type UpdateCategoryPayload = z.infer<typeof categorySchema> & {
  version: number;
};

export const categoryService = {
  getCategories: async (filters: Record<string, unknown> = {}) => {
    const response = await api.get<SuccessResponse<Category[]>>('/categories', {
      params: filters,
    });
    return response.data;
  },

  getDiscoveryTree: async () => {
    const response = await api.get<
      SuccessResponse<(Category & { children: Category[] })[]>
    >('/categories/discovery');
    return response.data;
  },

  getCategoryById: async (id: string) => {
    const response = await api.get<SuccessResponse<Category>>(
      `/categories/${id}`,
    );
    return response.data;
  },

  getCategoryByPath: async (path: string) => {
    const response = await api.get<SuccessResponse<Category>>(
      `/categories/path?path=${encodeURIComponent(path)}`,
    );
    return response.data;
  },

  getAncestors: async (path: string) => {
    const response = await api.get<SuccessResponse<Category[]>>(
      `/categories/ancestors?path=${encodeURIComponent(path)}`,
    );
    return response.data;
  },

  createCategory: async (data: CreateCategoryPayload) => {
    const response = await api.post<SuccessResponse<Category>>(
      '/admin/categories',
      data,
    );
    return response.data;
  },

  updateCategory: async (id: string, data: UpdateCategoryPayload) => {
    const response = await api.patch<SuccessResponse<Category>>(
      `/admin/categories/${id}`,
      data,
    );
    return response.data;
  },

  moveCategory: async (
    id: string,
    data: { parentId: string | null; version: number },
  ) => {
    const response = await api.patch<SuccessResponse<Category>>(
      `/admin/categories/${id}/move`,
      data,
    );
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete<SuccessResponse<void>>(
      `/admin/categories/${id}`,
    );
    return response.data;
  },
};
