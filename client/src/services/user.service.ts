import { api } from '@/lib/axios';
import {
  User,
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
} from '@atomecom/shared';

export const UserService = {
  getUsers: async (params?: any) => {
    const response = await api.get<{ data: User[]; pagination: any }>('users', {
      params,
    });
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await api.get<{ data: User }>(`users/${id}`);
    return response.data;
  },

  createUser: async (data: any) => {
    const response = await api.post<{ data: User }>('users', data);
    return response.data;
  },

  updateUser: async (id: string, data: any) => {
    const response = await api.patch<{ data: User }>(`users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    await api.delete(`users/${id}`);
  },

  getUserStats: async () => {
    const response = await api.get<{
      data: {
        total: number;
        active: number;
        banned: number;
        deactive: number;
        verified: number;
      };
    }>('users/stats');
    return response.data;
  },
};
