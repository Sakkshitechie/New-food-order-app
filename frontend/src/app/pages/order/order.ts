import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  userPhone: number = 0;
  userAddress: string = '';
  addressError: boolean = false;
  showAddressForm: boolean = false;
  showPaymentForm: boolean = false;
  cartItems: CartItem[] = [];
  paymentSuccessMessage: string = '';
  showPaymentSuccess: boolean = false;
  currentUserId: string | number | null = null;
  @ViewChild('deliveryDetailsTable') deliveryDetailsTable!: ElementRef;

  constructor(
    private authService: AuthService,
    private orderService: OrderService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrderFlow();
  }

  private loadOrderFlow(): void {
    this.authService.currentUser$.subscribe(currentUser => {
      if (currentUser && currentUser.id) {
        this.currentUserId = currentUser.id;
        this.userName = currentUser.name || '';
        this.userEmail = currentUser.email || '';
        this.userPhone = currentUser.phone || 0;
        this.userAddress = currentUser.address || '';
        
        this.loadCartItems();
      } else {
        this.currentUserId = 1;
        this.userName = 'Demo User';
        this.userEmail = 'demo@example.com';
        this.userPhone = 1234567890;
        this.userAddress = '';
        
        this.loadCartItems();
      }
    });
    
    this.showAddressForm = false;
    this.showPaymentForm = false;
  }

  private loadCartItems(): void {
    if (!this.currentUserId) return;
    
    this.cartService.getCart(this.currentUserId).subscribe(cartData => {
      this.cartItems = Array.isArray(cartData) ? cartData : [];
      this.cartService.updateCartItems(this.cartItems);
    });
  }

  changeQty(foodId: number, delta: number) {
    if (!this.currentUserId) return;
    
    const currentItem = this.cartItems.find(item => item.id === foodId);
    if (!currentItem) return;
    
    const newQuantity = currentItem.quantity + delta;
    
    if (newQuantity <= 0) {
      this.cartService.removeFromCart(this.currentUserId, foodId).subscribe(() => {
        this.loadCartItems();
      });
    } else {
      currentItem.quantity = newQuantity;
      
      this.cartService.updateQuantity(this.currentUserId, foodId, newQuantity).subscribe(() => {
        this.loadCartItems();
      });
    }
  }

  remove(foodId: number) {
    if (!this.currentUserId) return;
    this.cartService.removeFromCart(this.currentUserId, foodId).subscribe(() => {
      this.loadCartItems();
    });
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
  }

  getFormattedTotalPrice(): string {
    return this.getTotalPrice().toFixed(2);
  }

  getFormattedPrice(price: number): string {
    return price.toFixed(2);
  }

  getFormattedItemTotal(price: number, quantity: number): string {
    return (price * quantity).toFixed(2);
  }

  proceedToAddress() {
    this.showAddressForm = true;
    setTimeout(() => {
      if (this.deliveryDetailsTable?.nativeElement) {
        this.deliveryDetailsTable.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  submitAddress() {
    if (!this.userAddress || this.userAddress.trim().length === 0) {
      this.addressError = true;
      return;
    }
    this.addressError = false;
    this.showAddressForm = false;
    this.showPaymentForm = true;
    setTimeout(() => {
      if (this.deliveryDetailsTable?.nativeElement) {
        this.deliveryDetailsTable.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  onPaymentComplete(paymentMethod: string) {
    if (!this.currentUserId || this.cartItems.length === 0) {
      this.paymentSuccessMessage = 'Cannot process order. Please try again.';
      this.showPaymentSuccess = true;
      this.showPaymentForm = false;
      return;
    }

    this.orderService.createOrderFromCart(this.currentUserId, this.userAddress || '').subscribe({
      next: (order) => {
        this.paymentSuccessMessage = `Payment successful using ${paymentMethod}! Order ID: ${order.id}`;
        this.showPaymentSuccess = true;
        this.showPaymentForm = false;
        
        this.cartItems = [];
        this.cartService.updateCartItems([]);
        
        this.orderService.updateOrderStatus(order.id, 'Paid').subscribe();
      },
      error: (error) => {
        this.paymentSuccessMessage = 'Failed to create order. Please try again.';
        this.showPaymentSuccess = true;
        this.showPaymentForm = false;
      }
    });
  }
}
