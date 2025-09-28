import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { CartItem } from '../../Models/CartItem';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class Payment {
  selectedMethod: string = 'credit-card';
  paymentStatus: string = '';
  orderId: number | null = null;
  orderSuccess: boolean = false;

  @Input() cartItems: CartItem[] = [];
  @Input() total: number = 0;
  @Input() address: string = '';

  @Output() paymentCompleted = new EventEmitter<string>();

  constructor(private orderService: OrderService, private router: Router) {}

  getFormattedTotal(): string {
    return this.total.toFixed(2);
  }

  pay() {
    this.paymentStatus = 'Payment successful using ' + this.selectedMethod;
    this.paymentCompleted.emit(this.selectedMethod);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }
}

