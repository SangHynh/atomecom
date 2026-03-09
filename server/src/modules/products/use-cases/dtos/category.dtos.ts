import { PRODUCT_STATUS } from '@atomecom/shared';

export interface CreateCategoryDTO {
  name: string;
  slug: string;
  parentPath?: string | null;
  image?: string;
  description?: string;
  attributeDefinitions?: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select';
    options?: string[];
    required: boolean;
  }>;
  status: PRODUCT_STATUS;
}

export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  image?: string;
  description?: string;
  attributeDefinitions?: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'boolean' | 'select';
    options?: string[];
    required: boolean;
  }>;
  status?: PRODUCT_STATUS;
  version: number;
}

export interface MoveCategoryDTO {
  parentPath: string | null;
  version: number;
}

export interface CategoryQueryDTO {
  keyword?: string;
  path?: string | null;
  level?: number;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}
