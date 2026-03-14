'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormSchema } from '@atomecom/shared';
import { SkuManager } from '../sku-manager';

interface InventoryStepProps {
  form: UseFormReturn<ProductFormSchema>;
}

export function InventoryStep({ form }: InventoryStepProps) {
  return (
    <div className="animate-in fade-in duration-500 fill-mode-both">
      <SkuManager form={form} />
    </div>
  );
}



