import { PRODUCT_STATUS } from '@atomecom/shared';

export interface BrandEntity {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  status: PRODUCT_STATUS;
  deletedAt?: Date;
  description?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
