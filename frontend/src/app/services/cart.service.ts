import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CartItem } from '../Models/CartItem';
import { Observable, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000/api/cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

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

  // Get cart with authentication
  getCart(userId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`, { headers: this.authService.getAuthHeaders() });
  }

  // Add to cart with authentication
  addToCart(userId: string | number, item: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/add`, item, { headers: this.authService.getAuthHeaders() });
  }

  // Remove from cart with authentication
  removeFromCart(userId: string | number, itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/item/${itemId}`, { headers: this.authService.getAuthHeaders() });
  }

  // Update quantity with authentication
  updateQuantity(userId: string | number, itemId: number, quantity: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/item/${itemId}`, { quantity }, { headers: this.authService.getAuthHeaders() });
  }

  // Clear cart with authentication
  clearCart(userId: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`, { headers: this.authService.getAuthHeaders() });
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
