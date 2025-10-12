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
    return this.http.get(`${this.apiUrl}`, { withCredentials: true });
  }

  getOrderById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getOrdersByUser(userId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}?userId=${userId}`, { withCredentials: true });
  }

  createOrderFromCart(userId: string | number, address?: string): Observable<any> {
    return this.http.post(`${this.cartApiUrl}/${userId}/checkout`, { address },{ withCredentials: true });
  }

  createOrder(order: Order): Observable<any> {
    return this.http.post(`${this.apiUrl}`, order, { withCredentials: true });
  }
  
  updateOrder(id: number, order: Order): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, order, { withCredentials: true });
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { status }, { withCredentials: true });
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
  cancelOrder(orderId: number): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/${orderId}/cancel`, {}, { withCredentials: true });
}
}
