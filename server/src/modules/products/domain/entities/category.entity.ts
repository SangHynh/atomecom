import { PRODUCT_STATUS } from '@atomecom/shared';

export interface CategoryEntity {
  id: string;
  name: string;
  slug: string;
  path: string; // Pure Materialized Path e.g. ",electronics,smartphones,"
  // `level` is NOT stored - computed from path: path.split(',').filter(Boolean).length
  status: PRODUCT_STATUS;
  deletedAt?: Date;
  description?: string;
  icon?: string;
  attributeDefinitions: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select';
    options?: string[];
    required: boolean;
  }>;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Computes level from a Pure Materialized Path string */
export function computeLevel(path: string): number {
  return path.split(',').filter(Boolean).length;
}
