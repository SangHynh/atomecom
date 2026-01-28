import type { DISCOUNT_TYPE } from "../enum/discountType.enum.js";

export interface Discount {
  _id: string;
  code: string;
  type: DISCOUNT_TYPE;
  value: number;

  // Conditions
  minOrderValue: number; // Minimum order value to apply discount
  startDate: Date;
  endDate: Date;

  // Usage tracking
  usageLimit: number; // Maximum number of times discount can be used
  usedCount: number;

  isActive: boolean; // Admin can turn off discount
  version: number; // For optimistic locking
}
