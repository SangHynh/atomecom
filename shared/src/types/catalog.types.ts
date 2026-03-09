import { PRODUCT_STATUS } from '../enums/productStatus.enum.js';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  status: PRODUCT_STATUS;
  version: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  path: string;
  level: number; // Computed from path: path.split(',').filter(Boolean).length
  description?: string;
  icon?: string;
  status: PRODUCT_STATUS;
  attributeDefinitions: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select';
    options?: string[];
    required: boolean;
  }>;
  version: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  description?: string;
  shortDescription: string;
  thumbnail: string;
  images: string[];
  specs: Array<{ key: string; value: string }>;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  status: PRODUCT_STATUS;
  avgRating: number;
  totalReviews: number;
  version: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PriceHistory {
  basePrice: number;
  salePrice?: number;
  type: 'MANUAL' | 'PROMOTION';
  reason?: string;
  appliedAt: Date | string;
}

export interface Sku {
  id: string;
  productId: string;
  skuCode: string;
  barcode?: string;
  name: string;
  attributes: Array<{
    key: string;
    value: string;
    label: string;
  }>;
  price: {
    basePrice: number;
    salePrice?: number;
  };
  priceHistory: PriceHistory[];
  images: string[];
  status: 'ACTIVE' | 'INACTIVE';
  version: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
