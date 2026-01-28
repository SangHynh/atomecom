interface CartItem {
  skuId: string;
  name: string;
  variantName: string;
  thumb: string;
  price: number;
  quantity: number;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
}
