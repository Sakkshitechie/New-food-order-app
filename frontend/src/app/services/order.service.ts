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

  // Pure HTTP GET for all orders
  getAllOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // Pure HTTP GET for order by ID
  getOrderById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Get orders for a specific user from global order collection
  getOrdersByUser(userId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}?userId=${userId}`);
  }

  // Create order from cart (checkout)
  createOrderFromCart(userId: string | number, address?: string): Observable<any> {
    return this.http.post(`${this.cartApiUrl}/${userId}/checkout`, { address });
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
