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
 
  updateCartItems(items: CartItem[]) {
    this.cartItemsSubject.next(items);
  }

  get cartItemsValue(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  get cartCount(): number {
    return this.cartItemsValue.reduce((total, item) => total + item.quantity, 0);
  }
  getCart(userId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`, { headers: this.authService.getAuthHeaders() });
  }
  addToCart(userId: string | number, item: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/add`, item, { headers: this.authService.getAuthHeaders() });
  }
  removeFromCart(userId: string | number, itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/item/${itemId}`, { headers: this.authService.getAuthHeaders() });
  }
  updateQuantity(userId: string | number, itemId: number, quantity: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/item/${itemId}`, { quantity }, { headers: this.authService.getAuthHeaders() });
  }
  clearCart(userId: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`, { headers: this.authService.getAuthHeaders() });
  }
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
