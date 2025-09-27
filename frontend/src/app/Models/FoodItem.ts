export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  type: 'main-course'|'desserts'|'snacks'|'salads'|'soups';
}