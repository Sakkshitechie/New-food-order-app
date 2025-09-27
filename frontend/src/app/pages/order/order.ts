import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Payment } from '../payment/payment';
import { CartItem } from '../../Models/CartItem';
import { Order as OrderModel } from '../../Models/Order';

@Component({
  selector: 'app-order',
  imports: [CommonModule, FormsModule, RouterLink, Payment],
  templateUrl: './order.html',
  styleUrl: './order.css'
})
export class Order implements OnInit {
  userName: string = '';
  userEmail: string = '';
  userPhone: string = '';
  userAddress: string = '';
  addressError: boolean = false;
  showAddressForm: boolean = false;
  showPaymentForm: boolean = false;
  cartItems: CartItem[] = [];
  paymentSuccessMessage: string = '';
  showPaymentSuccess: boolean = false;

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadNewOrderFlow();
  }

  private loadNewOrderFlow(): void {
    this.cartItems = [];
    this.userName = 'Demo User';
    this.userEmail = 'demo@example.com';
    this.userPhone = '1234567890';
    
    this.showAddressForm = false;
    this.showPaymentForm = false;
  }

  changeQty(id: number, change: number) {
    const userId = 1; // Default user ID for demo
    this.cartService.updateQuantity(userId, id, change).subscribe(
      (data) => {}
    );
  }

  remove(id: number) {
    const userId = 1; // Default user ID for demo
    this.cartService.removeFromCart(userId, id).subscribe(
      (data) => {}
    );
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
  }

  proceedToAddress() {
    this.showAddressForm = true;
  }

  submitAddress() {
    if(!this.userAddress || this.userAddress.trim().length === 0) {
      this.addressError = true;
      return;
    }
    this.addressError = false;
    this.showAddressForm = false;
    this.showPaymentForm = true;
  }

  onPaymentComplete(paymentMethod: string) {
    const total = this.getTotalPrice();
    const orderId = Date.now();
    const order: OrderModel = {
      id: orderId,
      userId: 1,
      items: this.cartItems,
      total: total,
      orderDate: new Date().toISOString(),
      status: 'paid',
      address: this.userAddress,
      customerName: this.userName,
      customerPhone: this.userPhone,
      customerEmail: this.userEmail
    };

    this.orderService.createOrder(order).subscribe(
      (data) => {
        const userId = 1; 
        this.cartService.clearCart(userId).subscribe(
          () => {
            this.paymentSuccessMessage = `Payment successful using ${paymentMethod} having Order ID: ${orderId}`;
            this.showPaymentSuccess = true;
            this.showPaymentForm = false;
          }
        );
      }
    );
  }
}
