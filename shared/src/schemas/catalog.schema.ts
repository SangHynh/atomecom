import { z } from 'zod';
import { PRODUCT_STATUS } from '../enums/productStatus.enum.js';
import { ErrorCatalogCodes } from '../constants/error.constants.js';

export const brandSchema = z.object({
  name: z.string().min(2, ErrorCatalogCodes.NAME_IS_REQUIRED),
  slug: z.string().min(2, ErrorCatalogCodes.SLUG_IS_REQUIRED),
  logo: z.string().optional().or(z.literal('')),
  description: z
    .string()
    .max(500, ErrorCatalogCodes.DESCRIPTION_TOO_LONG)
    .optional(),
  status: z.nativeEnum(PRODUCT_STATUS).default(PRODUCT_STATUS.PUBLISHED),
});

export const categorySchema = z.object({
  name: z.string().min(2, ErrorCatalogCodes.NAME_IS_REQUIRED),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional().nullable(),
  status: z.nativeEnum(PRODUCT_STATUS).default(PRODUCT_STATUS.PUBLISHED),
});

export const skuSchema = z.object({
  skuCode: z.string().min(1, ErrorCatalogCodes.SKU_CODE_REQUIRED),
  barcode: z.string().optional(),
  name: z.string().min(1, ErrorCatalogCodes.NAME_IS_REQUIRED),
  attributes: z
    .array(
      z.object({
        key: z.string().min(1),
        value: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .default([]),
  price: z.object({
    basePrice: z.coerce
      .number()
      .min(1, ErrorCatalogCodes.PRICE_MUST_BE_POSITIVE),
    salePrice: z.coerce.number().optional(),
  }),
  images: z.array(z.string()).default([]),
  initialQuantity: z.coerce.number().min(0).default(0),
});

export const productFormSchema = z.object({
  name: z.string().min(1, ErrorCatalogCodes.NAME_IS_REQUIRED),
  slug: z.string().min(1, ErrorCatalogCodes.SLUG_IS_REQUIRED),
  brandId: z.string().min(1, ErrorCatalogCodes.BRAND_IS_REQUIRED),
  categoryId: z.string().min(1, ErrorCatalogCodes.CATEGORY_IS_REQUIRED),
  description: z.string().optional(),
  shortDescription: z
    .string()
    .min(1, ErrorCatalogCodes.SHORT_DESCRIPTION_IS_REQUIRED),
  thumbnail: z.string().optional(),
  images: z.array(z.string()),
  specs: z.array(
    z.object({ key: z.string().min(1), value: z.string().min(1) }),
  ),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()),
  }),
  status: z.nativeEnum(PRODUCT_STATUS),
  skus: z.array(skuSchema).optional(),
});

export type BrandSchema = z.infer<typeof brandSchema>;
export type CategorySchema = z.infer<typeof categorySchema>;
export type SkuSchema = z.infer<typeof skuSchema>;
export type ProductFormSchema = z.infer<typeof productFormSchema>;

// Request Schemas for Backend Validation

// Brands
export const CreateBrandRequestSchema = z.object({
  body: brandSchema,
});

export const UpdateBrandRequestSchema = z.object({
  params: z.object({ id: z.string() }),
  body: brandSchema.partial(),
});

// Categories
export const CreateCategoryRequestSchema = z.object({
  body: categorySchema,
});

export const UpdateCategoryRequestSchema = z.object({
  params: z.object({ id: z.string() }),
  body: categorySchema.partial(),
});

export const MoveCategoryRequestSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    parentId: z.string().nullable(),
  }),
});

// Skus
export const UpdateSkuRequestSchema = z.object({
  params: z.object({ id: z.string() }),
  body: skuSchema.partial(),
});

export const UpdateSkuPriceRequestSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    basePrice: z.number().min(0),
    salePrice: z.number().min(0).optional(),
  }),
});

// Products
export const CreateProductRequestSchema = z.object({
  body: productFormSchema,
});

export const UpdateProductRequestSchema = z.object({
  params: z.object({ id: z.string() }),
  body: productFormSchema.partial(),
});
