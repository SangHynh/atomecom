import type { PRODUCT_STATUS } from '@enum/productStatus.enum.js';

export interface Product {
  _id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  category?: string;
  brand?: string;
  images: string[];
  avgRating: number;
  totalReviews: number;
  status: PRODUCT_STATUS;
}
