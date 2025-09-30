import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../Models/Order';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/api/orders';
  private cartApiUrl = 'http://localhost:3000/api/cart';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getAllOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { headers: this.authService.getAuthHeaders() });
  }

  getOrderById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.authService.getAuthHeaders() });
  }

  getOrdersByUser(userId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}?userId=${userId}`, { headers: this.authService.getAuthHeaders() });
  }

  createOrderFromCart(userId: string | number, address?: string): Observable<any> {
    return this.http.post(`${this.cartApiUrl}/${userId}/checkout`, { address }, { headers: this.authService.getAuthHeaders() });
  }

  createOrder(order: Order): Observable<any> {
    return this.http.post(`${this.apiUrl}`, order, { headers: this.authService.getAuthHeaders() });
  }
  
  updateOrder(id: number, order: Order): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, order, { headers: this.authService.getAuthHeaders() });
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { status }, { headers: this.authService.getAuthHeaders() });
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.authService.getAuthHeaders() });
  }
}
