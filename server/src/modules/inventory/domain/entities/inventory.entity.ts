export interface InventoryEntity {
  skuId: string;
  quantity: number;
  reserved: number;
  available: number; // quantity - reserved
  lowStockThreshold: number;
  location?: string;
  deletedAt?: Date;
  updatedAt: Date;
}
