import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CartItem } from '../Models/CartItem';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000/api/cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Update cart items and notify subscribers
  updateCartItems(items: CartItem[]) {
    this.cartItemsSubject.next(items);
  }

  get cartItemsValue(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  get cartCount(): number {
    return this.cartItemsValue.reduce((total, item) => total + item.quantity, 0);
  }

  // Pure HTTP GET for cart by user ID
  getCart(userId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`);
  }

  // Pure HTTP POST for add to cart
  addToCart(userId: string | number, item: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/add`, item);
  }

  // Pure HTTP DELETE for remove from cart
  removeFromCart(userId: string | number, itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/item/${itemId}`);
  }

  // Pure HTTP PATCH for update quantity
  updateQuantity(userId: string | number, itemId: number, quantity: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/item/${itemId}`, { quantity });
  }

  // Pure HTTP DELETE for clear cart
  clearCart(userId: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }

  // Helper method to load and update cart state
  async loadAndUpdateCart(userId: string | number) {
    try {
      const cartData = await this.getCart(userId).toPromise();
      const items = Array.isArray(cartData) ? cartData : [];
      this.updateCartItems(items);
      return items;
    } catch (error) {
      this.updateCartItems([]);
      return [];
    }
  }
}
