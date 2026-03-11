import { api } from '@/lib/axios';
import { z } from 'zod';
import { Product, SuccessResponse, productFormSchema } from '@atomecom/shared';

type CreateProductPayload = z.infer<typeof productFormSchema>;
type UpdateProductPayload = z.infer<typeof productFormSchema> & {
  version: number;
};

export const productService = {
  getProducts: async (filters: Record<string, any> = {}) => {
    const response = await api.get<SuccessResponse<Product[]>>('/products', {
      params: filters,
    });
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await api.get<SuccessResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data: CreateProductPayload) => {
    const response = await api.post<SuccessResponse<Product>>(
      '/admin/products',
      data,
    );
    return response.data;
  },

  updateProduct: async (id: string, data: UpdateProductPayload) => {
    const response = await api.put<SuccessResponse<Product>>(
      `/admin/products/${id}`,
      data,
    );
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await api.delete<SuccessResponse<void>>(
      `/admin/products/${id}`,
    );
    return response.data;
  },
};
