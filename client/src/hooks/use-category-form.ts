'use client';

import React, { useEffect } from 'react';
import { useForm, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  categorySchema,
  CategorySchema,
  Category,
  PRODUCT_STATUS,
} from '@atomecom/shared';
import { generateSlug } from '@/lib/utils';
import { handleBackendValidationError } from '@/lib/form-utils';

interface UseCategoryFormProps {
  category?: Category;
  onSubmit: (data: CategorySchema) => void;
}

export function useCategoryForm({ category, onSubmit }: UseCategoryFormProps) {
  const form = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema) as any,
    defaultValues: {
      name: category?.name || '',
      slug: category?.slug || '',
      description: category?.description || '',
      parentId: (category?.parentId as string) || 'root',
      image: category?.image || '',
      status: (category?.status as PRODUCT_STATUS) || PRODUCT_STATUS.PUBLISHED,
    } as DefaultValues<CategorySchema>,
  });

  const watchName = form.watch('name');

  useEffect(() => {
    if (!category && watchName) {
      form.setValue('slug', generateSlug(watchName), { shouldValidate: true });
    }
  }, [watchName, category, form]);

  const handleActualSubmit = async (data: CategorySchema) => {
    try {
      const formattedData: CategorySchema = {
        ...data,
        parentId: data.parentId === 'root' ? null : data.parentId,
      };
      await onSubmit(formattedData);
    } catch (error: unknown) {
      handleBackendValidationError(error, form);
    }
  };

  return {
    form,
    handleActualSubmit,
  };
}
