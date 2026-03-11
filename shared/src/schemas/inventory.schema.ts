import { z } from 'zod';

export const ReserveInventoryRequestSchema = z.object({
  body: z.object({
    skuId: z.string(),
    quantity: z.number().min(1),
    orderId: z.string(),
  }),
});

export const ReleaseInventoryRequestSchema = z.object({
  body: z.object({
    skuId: z.string(),
    quantity: z.number().min(1),
    orderId: z.string(),
  }),
});

export const AddStockRequestSchema = z.object({
  params: z.object({
    skuId: z.string(),
  }),
  body: z.object({
    quantity: z.number().min(1),
    reason: z.string().optional(),
  }),
});
