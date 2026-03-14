'use client';

import { useEffect } from 'react';
import { useForm, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  brandSchema,
  BrandSchema,
  Brand,
  PRODUCT_STATUS,
} from '@atomecom/shared';
import { generateSlug } from '@/lib/utils';
import { handleBackendValidationError } from '@/lib/form-utils';

interface UseBrandFormProps {
  initialData?: Brand;
  onSubmit: (data: BrandSchema) => void;
}

export function useBrandForm({ initialData, onSubmit }: UseBrandFormProps) {
  const form = useForm<BrandSchema>({
    resolver: zodResolver(brandSchema) as any,
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      logo: initialData?.logo || '',
      description: initialData?.description || '',
      status: (initialData?.status as PRODUCT_STATUS) || PRODUCT_STATUS.PUBLISHED,
    } as DefaultValues<BrandSchema>,
  });

  const watchName = form.watch('name');

  useEffect(() => {
    if (!initialData && watchName) {
      form.setValue('slug', generateSlug(watchName), { shouldValidate: true });
    }
  }, [watchName, initialData, form]);

  const handleActualSubmit = async (data: BrandSchema) => {
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
