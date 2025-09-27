import { FoodItem } from "./FoodItem";

export interface CartItem extends FoodItem {
  quantity: number;
}