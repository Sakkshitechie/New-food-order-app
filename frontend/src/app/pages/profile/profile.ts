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
    if (!this.isValidUser(this.user) || !this.validateUserData()) {
      return;
    }

    this.isLoading = true;
    
    this.authService.updateProfile(this.user.id, {
      name: this.user.name,
      email: this.user.email,
      phone: this.user.phone
    }).subscribe({
      next: (response) => {
        this.edit = false;
        this.statusMessage = 'Profile updated successfully';
        this.statusType = 'success';
        this.isLoading = false;
        
        if (response?.user) {
          const currentToken = this.authService.getAccessToken();
          const currentRefreshToken = this.authService.getRefreshToken();
          if (currentToken) {
            this.authService.setCurrentUser(response.user, currentToken, currentRefreshToken || undefined);
          }
          this.user = { ...response.user };
          this.originalUser = { ...response.user };
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.statusType = 'error';
        
        if (error.status === 409 || error.error?.message?.toLowerCase().includes('already registered')) {
          const errorMsg = error.error?.message || '';
          
          if (errorMsg.toLowerCase().includes('email')) {
            this.statusMessage = 'This email is already registered. Please use a different email.';
            if (this.originalUser?.email) this.user!.email = this.originalUser.email;
          } else if (errorMsg.toLowerCase().includes('phone')) {
            this.statusMessage = 'This phone number is already registered. Please use a different phone number.';
            if (this.originalUser?.phone) this.user!.phone = this.originalUser.phone;
          } else {
            this.statusMessage = 'Email or phone number already registered by another user.';
            if (this.originalUser?.email) this.user!.email = this.originalUser.email;
            if (this.originalUser?.phone) this.user!.phone = this.originalUser.phone;
          }
        } else {
          this.statusMessage = 'Failed to update profile. Please try again.';
          if (this.originalUser) {
            this.user = { ...this.originalUser };
          }
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

    if (!this.user.name?.trim()) {
      this.setError('Name is required');
      return false;
    }

    if (!this.user.email?.trim()) {
      this.setError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.setError('Please enter a valid email address');
      return false;
    }

    if (!this.user.phone) {
      this.setError('Phone number is required');
      return false;
    }

    const phoneRegex = /^[6-9]{1}\d{9}$/;
    const phoneStr = this.user.phone.toString().trim();
    if (!phoneRegex.test(phoneStr)) {
      this.setError('Phone number must be 10 digits and start with 6, 7, 8, or 9');
      return false;
    }

    return true;
  }

  private setError(message: string): void {
    this.statusMessage = message;
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
}
