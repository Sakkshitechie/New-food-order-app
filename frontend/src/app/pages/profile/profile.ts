import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../Models/User';
import { Order } from '../../Models/Order';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, RouterModule, CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  edit = false;
  user: User | null = null;
  originalUser: User | null = null;
  orders: Order[] = [];
  showOrders = false;
  statusMessage = '';
  profileMessage = '';
  statusType: 'success' | 'error' | '' = '';
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private orderService: OrderService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(currentUser => {
      if (currentUser?.id) {
        this.user = { ...currentUser };
        this.originalUser = { ...currentUser };
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  enableEdit(): void {
    this.edit = true;
    this.clearMessages();
  }

  save(): void {
    if (!this.user || !this.validateUserData()) return;
    this.isLoading = true;

    this.authService.updateProfile(
      {
        name: this.user?.name,
        email: this.user?.email,
        phone: this.user?.phone
      }
    ).subscribe({
      next: (response) => {
        this.edit = false;
        this.profileMessage = 'Profile updated successfully';
        this.statusType = 'success';
        this.isLoading = false;

        if (response?.user) {
          this.user = { ...response.user };
          this.originalUser = { ...response.user };
          this.authService.currentUserSubject.next(response.user);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.statusType = 'error';
        if (error?.error?.message) {
          this.profileMessage = error.error.message;
        } else {
          this.profileMessage = 'Failed to update profile. Please try again.';
        }
        if (this.originalUser) {
          this.user = { ...this.originalUser };
        }
      }
    });
  }

  cancel(): void {
    this.edit = false;
    this.clearMessages();
    
    if (this.originalUser) {
      this.user = { ...this.originalUser };
    }
  }

  toggleOrders(): void {
    this.showOrders = !this.showOrders;
    
    if (this.showOrders && this.isValidUser(this.user)) {
      this.isLoading = true;
      
      this.orderService.getOrdersByUser(this.user.id).subscribe({
        next: (data) => {
          this.orders = data || [];
          this.isLoading = false;
        },
        error: () => {
          this.statusMessage = 'Failed to load orders';
          this.statusType = 'error';
          this.isLoading = false;
          this.orders = [];
        }
      });
    }
  }

  logout(): void {
    this.isLoading = true;
    
    this.authService.logout().subscribe({
      next: () => {
        this.authService.clearCurrentUser();
        this.router.navigate(['/login']);
        this.isLoading = false;
      },
      error: () => {
        this.authService.clearCurrentUser();
        this.router.navigate(['/login']);
        this.isLoading = false;
      }
    });
  }

  private validateUserData(): boolean {
    if (!this.user?.id) {
      this.setError('User data is missing');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.setError('Please enter a valid email address');
      return false;
    }
    const phoneRegex = /^[6-9]{1}\d{9}$/;
    if (!phoneRegex.test(this.user.phone?.toString() || '')) {
      this.setError('Phone number must be 10 digits and start with 6, 7, 8, or 9');
      return false;
    }
    return true;
  }

  private setError(message: string): void {
    this.profileMessage = message;
    this.statusType = 'error';
  }

  private isValidUser(user: User | null): user is User & { id: number | string } {
    return !!(user?.id);
  }

  clearMessages(): void {
    this.statusMessage = '';
    this.statusType = '';
  }

  isFormValid(): boolean {
    if (!this.user) return false;
    
    const nameValid = this.user.name?.trim() && /^[A-Za-z\s]+$/.test(this.user.name);
    const emailValid = this.user.email?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.user.email);
    const phoneValid = this.user.phone && /^[6-9]{1}\d{9}$/.test(this.user.phone.toString().trim());
    
    return !!(nameValid && emailValid && phoneValid);
  }

  getFormattedPrice(price: number): string {
    return price ? price.toFixed(2) : '0.00';
  }

  getFormattedItemTotal(price: number, quantity: number): string {
    return (price * quantity).toFixed(2);
  }
  cancelOrder(orderId: number): void {
  this.isLoading = true;

  this.orderService.cancelOrder(orderId).subscribe({
    next: () => {
      this.orders = this.orders.map(order =>
        order.id === orderId && order.status === 'Paid'
          ? { ...order, status: 'Cancelled' }
          : order
      );
      this.statusMessage = 'Order cancelled successfully';
      this.statusType = 'success';
      this.isLoading = false;
    },
    error: () => {
      this.statusMessage = 'Failed to cancel order. Please try again.';
      this.statusType = 'error';
      this.isLoading = false;
    }
  });
}

deleteOrder(orderId: number): void {
  this.isLoading = true;

  this.orderService.deleteOrder(orderId).subscribe({
    next: () => {
      this.orders = this.orders.filter(order => order.id !== orderId);
      this.statusMessage = 'Order removed successfully';
      this.statusType = 'success';
      this.isLoading = false;
    },
    error: () => {
      this.statusMessage = 'Failed to remove order. Please try again.';
      this.statusType = 'error';
      this.isLoading = false;
    }
  });
}
}
