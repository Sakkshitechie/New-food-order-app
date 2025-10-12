import { CartItem } from './CartItem';

export interface Order {
  id: number;
  userId: number;
  items: CartItem[];
  total: number;
  orderDate: string;
  status: string;
  address: string;
}
