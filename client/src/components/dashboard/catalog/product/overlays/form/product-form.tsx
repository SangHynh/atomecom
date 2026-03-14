'use client';

import { 
  Product, 
  PRODUCT_STATUS, 
  ProductFormSchema 
} from '@atomecom/shared';
import { useProductForm } from '@/hooks/use-product-form';

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
import { handleBackendValidationError } from '@/lib/form-utils';

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
  const { brands } = useBrands({ limit: 100 });
  const { categories } = useCategories({ limit: 100 });

  const { form, currentStep, handleActualSubmit, handleNext, handlePrev } =
    useProductForm({
      initialData,
      onSubmit,
      stepsCount: STEPS.length,
    });

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



