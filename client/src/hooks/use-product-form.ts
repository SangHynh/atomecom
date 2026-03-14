'use client';

import React, { useState, useEffect } from 'react';
import { useForm, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Product, 
  productFormSchema, 
  PRODUCT_STATUS, 
  ProductFormSchema 
} from '@atomecom/shared';
import { generateSlug } from '@/lib/utils';
import { handleBackendValidationError } from '@/lib/form-utils';

interface UseProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormSchema) => Promise<void>;
  stepsCount: number;
}

export function useProductForm({
  initialData,
  onSubmit,
  stepsCount,
}: UseProductFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const initialValues: ProductFormSchema = {
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    brandId: initialData?.brandId || '',
    categoryId: initialData?.categoryId || '',
    shortDescription: initialData?.shortDescription || '',
    description: initialData?.description || '',
    thumbnail: initialData?.thumbnail || '',
    images: initialData?.images || [],
    specs: initialData?.specs || [],
    status: (initialData?.status as PRODUCT_STATUS) || PRODUCT_STATUS.DRAFT,
    skus: (initialData as any)?.skus || [
      {
        name: 'Phiên bản mặc định',
        skuCode: generateSlug(initialData?.name || 'DEFAULT').toUpperCase(),
        barcode: '',
        price: { basePrice: 0 },
        initialQuantity: 0,
        attributes: [],
        images: [],
      },
    ],
    seo: {
      title: initialData?.seo?.title || '',
      description: initialData?.seo?.description || '',
      keywords: initialData?.seo?.keywords || [],
    },
  };

  const form = useForm<ProductFormSchema>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: initialValues as DefaultValues<ProductFormSchema>,
  });

  const handleActualSubmit = async (data: ProductFormSchema) => {
    try {
      await onSubmit(data);
    } catch (error: unknown) {
      handleBackendValidationError(error, form);
    }
  };

  const watchName = form.watch('name');

  useEffect(() => {
    if (!initialData && watchName) {
      form.setValue('slug', generateSlug(watchName), { shouldValidate: true });
    }
  }, [watchName, initialData, form]);

  const handleNext = async () => {
    const fieldsToValidate: Record<number, Array<keyof ProductFormSchema>> = {
      0: ['name', 'slug', 'brandId', 'categoryId'],
      1: ['skus'],
      2: ['specs'],
      3: ['thumbnail', 'status'],
    };

    if (fieldsToValidate[currentStep]) {
      const isValid = await form.trigger(fieldsToValidate[currentStep] as any);
      if (!isValid) return;
    }

    if (currentStep < stepsCount - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    form,
    currentStep,
    handleActualSubmit,
    handleNext,
    handlePrev,
  };
}
