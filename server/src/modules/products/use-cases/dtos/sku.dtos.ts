export interface CreateSkuDTO {
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
  images: string[];
  initialQuantity: number; // For inventory creation
}

export interface UpdateSkuDTO {
  skuCode?: string;
  barcode?: string;
  name?: string;
  attributes?: Array<{
    key: string;
    value: string;
    label: string;
  }>;
  price?: {
    basePrice: number;
    salePrice?: number;
  };
  images?: string[];
  status?: 'ACTIVE' | 'INACTIVE';
  version: number; // Required for optimistic locking
}

export interface UpdateSkuPriceDTO {
  basePrice: number;
  salePrice?: number;
  reason: string;
  version: number; // Required for optimistic locking
}
