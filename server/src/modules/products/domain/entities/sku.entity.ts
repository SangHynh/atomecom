export interface PriceHistory {
  basePrice: number;
  salePrice?: number;
  type: 'MANUAL' | 'PROMOTION';
  reason?: string;
  appliedAt: Date;
}

export interface SkuEntity {
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
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
