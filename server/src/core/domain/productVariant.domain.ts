interface PriceLog {
  price: number;
  appliedAt: Date;
}

interface ProductAttributes {
  color?: string;
  size?: string;
  material?: string;
  condition?: 'new' | 'secondhand' | string;
}

export interface ProductVariant {
    _id: string;
    product_id: string;
    name: string;
    sku: string;
    price: number;
    priceHistory: PriceLog[];
    atrributes?: ProductAttributes;
    stock: number;
    version: number; // use for optimistic locking
}