import type { PAYMENT_METHOD } from '../../../shared/enum/paymentMethod.enum.js';
import type { PAYMENT_STATUS } from '../../../shared/enum/paymentStatus.enum.js';
import type { SHIPPING_STATUS } from '../../../shared/enum/shippingStatus.enum.js';

export interface OrderItem {
  skuId: string;
  name: string;
  price: number; // Snapshot: price at the time of ordering
  quantity: number;
}

export interface OrderShipping {
  methodId: string;
  methodName: string; // Snapshot: "Fast Shipping"
  trackingNumber?: string;
  address: string;
  phone: string;
  fee: number;
  status: SHIPPING_STATUS;
}

export interface OrderPayment {
  method: PAYMENT_METHOD;
  status: PAYMENT_STATUS;
  transactionId?: string; // ID transaction from third-party (VNPAY, Stripe...)
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  shipping: OrderShipping;
  payment: OrderPayment;
  totalAmount: number; // (Items * Qty) + Fee - Discount
}
