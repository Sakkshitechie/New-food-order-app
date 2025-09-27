import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CartItem } from '../Models/CartItem';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:3000/api/cart';

  constructor(private http: HttpClient) {}

  // Pure HTTP GET for cart by user ID
  getCart(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}`);
  }

  // Pure HTTP POST for add to cart
  addToCart(userId: number, item: CartItem): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/add`, item);
  }

  // Pure HTTP DELETE for remove from cart
  removeFromCart(userId: number, itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/item/${itemId}`);
  }

  // Pure HTTP PUT for update quantity
  updateQuantity(userId: number, itemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/item/${itemId}`, { quantity });
  }

  // Pure HTTP DELETE for clear cart
  clearCart(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`);
  }
}
