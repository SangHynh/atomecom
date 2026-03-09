import type { PRODUCT_STATUS } from '@shared/enum/productStatus.enum.js';

export interface ProductEntity {
  id: string;
  name: string;
  slug: string; // URL slug for SEO
  brandId: string;
  categoryId: string;
  description?: string;
  shortDescription: string;
  thumbnail: string;
  images: string[];
  specs: Array<{ key: string; value: string }>; // Common technical specifications for all variants (e.g., Condition, Warranty)
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  status: PRODUCT_STATUS;
  avgRating: number;
  totalReviews: number;
  version: number;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
