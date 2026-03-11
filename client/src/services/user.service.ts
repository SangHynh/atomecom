import { api } from '@/lib/axios';
import { z } from 'zod';
import {
  User,
  createUserSchema,
  updateUserSchema,
  SuccessResponse,
} from '@atomecom/shared';

type CreateUserRequest = z.infer<typeof createUserSchema>;
type UpdateUserRequest = z.infer<typeof updateUserSchema>;

export const UserService = {
  getUsers: async (params?: Record<string, unknown>) => {
    const response = await api.get<SuccessResponse<User[]>>('users', {
      params,
    });
    const { data, metadata } = response.data;
    return {
      data,
      pagination: metadata?.pagination
        ? {
            totalElements: metadata.pagination.total_items,
            totalPages: metadata.pagination.total_pages,
            currentPage: metadata.pagination.page,
            elementsPerPage: metadata.pagination.limit,
          }
        : null,
    };
  },

  getUserById: async (id: string) => {
    const response = await api.get<SuccessResponse<User>>(`users/${id}`);
    return response.data;
  },

  createUser: async (data: CreateUserRequest) => {
    const response = await api.post<SuccessResponse<User>>('users', data);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserRequest) => {
    const response = await api.patch<SuccessResponse<User>>(
      `users/${id}`,
      data,
    );
    return response.data;
  },

  deleteUser: async (id: string) => {
    await api.delete(`users/${id}`);
  },

  getUserStats: async () => {
    const response = await api.get<
      SuccessResponse<{
        total: number;
        active: number;
        banned: number;
        deactive: number;
        verified: number;
      }>
    >('users/stats');
    return response.data;
  },
};
