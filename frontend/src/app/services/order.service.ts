import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../Models/Order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/api/orders';
  private cartApiUrl = 'http://localhost:3000/api/cart';

  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getOrderById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getOrdersByUser(userId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}?userId=${userId}`);
  }

  createOrderFromCart(userId: string | number, address?: string): Observable<any> {
    return this.http.post(`${this.cartApiUrl}/${userId}/checkout`, { address });
  }

  createOrder(order: Order): Observable<any> {
    return this.http.post(`${this.apiUrl}`, order);
  }
  
  updateOrder(id: number, order: Order): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, order);
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { status });
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
