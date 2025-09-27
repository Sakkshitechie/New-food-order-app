import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../Models/Order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient) {}

  // Pure HTTP GET for all orders
  getAllOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // Pure HTTP GET for order by ID
  getOrderById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Pure HTTP GET for orders by user ID
  getOrdersByUser(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  // Pure HTTP POST for create order
  createOrder(order: Order): Observable<any> {
    return this.http.post(`${this.apiUrl}`, order);
  }

  // Pure HTTP PUT for update order
  updateOrder(id: number, order: Order): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, order);
  }

  // Pure HTTP PATCH for update order status
  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, { status });
  }

  // Pure HTTP DELETE for delete order
  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
