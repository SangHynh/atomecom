'use client';

import { useForm, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, 
  createUserSchema, 
  USER_ROLE, 
  CreateUserSchema 
} from '@atomecom/shared';
import { handleBackendValidationError } from '@/lib/form-utils';

interface UseUserFormProps {
  user?: User;
  onSubmit: (data: CreateUserSchema) => void;
}

export function useUserForm({ user, onSubmit }: UseUserFormProps) {
  const form = useForm<CreateUserSchema>({
    resolver: zodResolver(createUserSchema) as any,
    defaultValues: {
      email: user?.email || '',
      name: user?.name || '',
      phone: user?.phone || '',
      role: (user?.role as USER_ROLE) || USER_ROLE.USER,
      password: '',
      addresses: user?.addresses || [],
    } as DefaultValues<CreateUserSchema>,
  });

  const handleActualSubmit = async (data: CreateUserSchema) => {
    try {
      await onSubmit(data);
    } catch (error: unknown) {
      handleBackendValidationError(error, form);
    }
  };

  return {
    form,
    handleActualSubmit,
  };
}
