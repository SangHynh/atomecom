import { PRODUCT_STATUS } from '@shared/enum/productStatus.enum.js';
import type { CreateSkuDTO } from './sku.dtos.js';

export interface CreateProductDTO {
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  images: string[];
  specs: Array<{ key: string; value: string }>;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  status?: PRODUCT_STATUS;
  skus: CreateSkuDTO[];
}

export interface UpdateProductDTO {
  name?: string;
  slug?: string;
  brandId?: string;
  categoryId?: string;
  description?: string;
  shortDescription?: string;
  thumbnail?: string;
  images?: string[];
  specs?: Array<{ key: string; value: string }>;
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
  status?: PRODUCT_STATUS;
  version: number; // Required for optimistic locking
}

export interface ProductQueryDTO {
  categoryId?: string;
  brandId?: string;
  status?: PRODUCT_STATUS;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
