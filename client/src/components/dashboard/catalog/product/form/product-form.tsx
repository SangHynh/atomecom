'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Product,
  productFormSchema,
  PRODUCT_STATUS,
  ProductFormSchema,
} from '@atomecom/shared';
import { DefaultValues } from 'react-hook-form';

type ProductFormValues = ProductFormSchema;
import { Form } from '@/components/ui/form';
import { BasicsStep } from './steps/basics-step';
import { AssetStep } from './steps/asset-step';
import { InventoryStep } from './steps/inventory-step';
import { SpecsStep } from './steps/specs-step';
import { Box, Info, Image as ImageIcon, Activity } from 'lucide-react';
import { generateSlug } from '@/lib/utils';
import { useBrands } from '@/hooks/use-brands';
import { useCategories } from '@/hooks/use-categories';
import { StudioFormHeader } from '@/components/dashboard/studio/studio-form-header';
import { StudioFormFooter } from '@/components/dashboard/studio/studio-form-footer';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormValues) => Promise<void>;
  isLoading?: boolean;
}

const STEPS = [
  { id: 'basics', title: 'Danh tính', icon: Info },
  { id: 'inventory', title: 'Biến thể', icon: Box },
  { id: 'specs', title: 'Thông số', icon: Activity },
  { id: 'content', title: 'Tư liệu', icon: ImageIcon },
];

export function ProductForm({
  initialData,
  onSubmit,
  isLoading,
}: ProductFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { brands } = useBrands({ limit: 100 });
  const { categories } = useCategories({ limit: 100 });

  const initialValues: z.infer<typeof productFormSchema> = {
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

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: initialValues as DefaultValues<ProductFormValues>,
  });

  const handleActualSubmit = async (data: ProductFormValues) => {
    try {
      await onSubmit(data);
    } catch (error: any) {
      if (error.response?.data?.message === 'VALIDATION_ERROR') {
        const backendErrors = error.response.data.errors || [];
        backendErrors.forEach((err: any) => {
          const path = Array.isArray(err.path)
            ? err.path.join('.').replace(/^body\./, '')
            : (err.path as string)?.replace(/^body\./, '');

          if (path) {
            form.setError(path as any, {
              type: 'manual',
              message: err.message,
            });
          }
        });
      }
    }
  };

  const watchName = form.watch('name');

  React.useEffect(() => {
    if (!initialData && watchName) {
      form.setValue('slug', generateSlug(watchName), { shouldValidate: true });
    }
  }, [watchName, initialData, form]);

  const handleNext = async () => {
    const fieldsToValidate: Record<number, Array<keyof ProductFormValues>> = {
      0: ['name', 'slug', 'brandId', 'categoryId'],
      1: ['skus'],
      2: ['specs'],
      3: ['thumbnail', 'status'],
    };

    if (fieldsToValidate[currentStep]) {
      const isValid = await form.trigger(fieldsToValidate[currentStep]);
      if (!isValid) return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleActualSubmit)}
        className="flex flex-col h-full bg-background"
      >
        <StudioFormHeader steps={STEPS} currentStep={currentStep} />

        <div className="flex-1 overflow-y-auto custom-scrollbar px-10 py-12">
          <div className="max-w-5xl mx-auto min-h-[450px]">
            {currentStep === 0 && (
              <BasicsStep form={form} brands={brands} categories={categories} />
            )}
            {currentStep === 1 && <InventoryStep form={form} />}
            {currentStep === 2 && <SpecsStep form={form} />}
            {currentStep === 3 && <AssetStep form={form} />}
          </div>
        </div>

        <StudioFormFooter
          currentStep={currentStep}
          totalSteps={STEPS.length}
          canGoBack={currentStep > 0}
          onPrev={handlePrev}
          onNext={handleNext}
          isLoading={isLoading}
          isSubmitStep={currentStep === STEPS.length - 1}
          submitLabel={
            initialData ? 'Cập nhật hồ sơ sản phẩm' : 'Đăng ký sản phẩm mới'
          }
        />
      </form>
    </Form>
  );
}
