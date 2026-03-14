import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { z } from 'zod';
import { UserService } from '@/services/user.service';
import {
  ErrorUserCodes,
  User,
  SuccessResponse,
  createUserSchema,
  updateUserSchema,
} from '@atomecom/shared';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { extractData, extractPagination } from '@/lib/api-utils';

type CreateUserRequest = z.infer<typeof createUserSchema>;
type UpdateUserRequest = z.infer<typeof updateUserSchema>;

export const useUsers = (filters?: Record<string, unknown>) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const usersQuery = useQuery({
    queryKey: ['users', filters],
    queryFn: () => UserService.getUsers(filters),
    placeholderData: keepPreviousData,
  });

  const statsQuery = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => UserService.getUserStats(),
    refetchInterval: 30000,
  });

  const createUserMutation = useMutation({
    mutationFn: UserService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success(t('users.actions.created_success'));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const code = error?.response?.data?.message;
      toast.error(
        code
          ? t(`errors.${code}`, { ns: 'errors', defaultValue: code })
          : t(`errors.${ErrorUserCodes.CREATE_USER_FAILED}`, { ns: 'errors' }),
      );
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      UserService.updateUser(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['users', filters] });
      const previousUsers = queryClient.getQueryData(['users', filters]);
      queryClient.setQueryData(
        ['users', filters],
        (old: SuccessResponse<User[]> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((user) =>
              user.id === id ? { ...user, ...data } : user,
            ),
          };
        },
      );
      return { previousUsers };
    },
    onError: (err: AxiosError<{ message: string }>, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(['users', filters], context.previousUsers);
      }
      const code = err?.response?.data?.message;
      toast.error(
        code
          ? t(`errors.${code}`, { ns: 'errors', defaultValue: code })
          : t(`errors.INTERNAL_SERVER_ERROR`, { ns: 'errors' }),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
    onSuccess: () => {
      toast.success(t('users.actions.updated_success'));
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: UserService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success(t('users.actions.deleted_success'));
    },
    onError: (error: AxiosError<{ message: string }>) => {
      const code = error?.response?.data?.message;
      toast.error(
        code
          ? t(`errors.${code}`, { ns: 'errors', defaultValue: code })
          : t(`errors.INTERNAL_SERVER_ERROR`, { ns: 'errors' }),
      );
    },
  });

  const data = usersQuery.data;
  const statsData = statsQuery.data;

  return {
    users: extractData(data) || [],
    pagination: extractPagination(data) || {
      totalElements: 0,
      totalPages: 0,
      currentPage: 1,
      elementsPerPage: 10,
    },
    stats: extractData(statsData) || {
      total: 0,
      active: 0,
      banned: 0,
      deactive: 0,
      verified: 0,
    },
    isLoadingStats: statsQuery.isLoading,
    isErrorStats: statsQuery.isError,
    isLoading: usersQuery.isLoading,
    isFetching: usersQuery.isFetching,
    isError: usersQuery.isError,
    error: usersQuery.error,
    createUser: createUserMutation.mutate,
    createUserAsync: createUserMutation.mutateAsync,
    isCreating: createUserMutation.isPending,
    updateUser: updateUserMutation.mutate,
    updateUserAsync: updateUserMutation.mutateAsync,
    isUpdating: updateUserMutation.isPending,
    deleteUser: deleteUserMutation.mutate,
    deleteUserAsync: deleteUserMutation.mutateAsync,
    isDeleting: deleteUserMutation.isPending,
  };
};
