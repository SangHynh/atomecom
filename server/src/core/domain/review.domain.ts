export interface Review {
  _id: string;
  productId: string;  
  userId: string;     
  orderId: string;    
  rating: number;     
  comment: string;    
  images?: string[];  
}