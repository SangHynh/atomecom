export interface CreateBrandDTO {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
}

export interface UpdateBrandDTO {
  name?: string;
  slug?: string;
  logo?: string;
  description?: string;
  website?: string;
  version: number; // Required for optimistic locking
}

export interface BrandQueryDTO {
  keyword?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}
