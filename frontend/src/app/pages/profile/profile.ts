import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule, Router, ActivatedRoute } from '@angular/router';
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
  error:any;
  user: User | null = null;
  orders: Order[] = [];
  showOrders: boolean = false;
  statusMessage: string = '';
  statusType: 'success' | 'error' | '' = '';
  userId: number | null = null;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService, 
    private orderService: OrderService, 
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check for userId in query parameters
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'] ? Number(params['userId']) : null;
    });

    // Load user profile
    const targetUserId = this.userId || 1; // Default to user ID 1 for demo
    if (targetUserId) {
      this.loadUserProfile(targetUserId);
    }
  }

  private loadUserProfile(userId: number): void {
    this.isLoading = true;
    // Pure HTTP call - backend handles everything
    this.authService.getUserById(userId).subscribe(
      (data) => {
        this.user = data;
        this.isLoading = false;
      }
    );
  }

  enableEdit(): void {
    this.edit = true;
    this.clearMessages();
  }

  save(): void {
    if (!this.user || !this.user.id) {
      this.showError('Cannot update profile - user data invalid');
      return;
    }

    if (!this.validateUserData()) {
      return;
    }

    this.isLoading = true;
    
    // Pure HTTP call - backend handles everything
    this.authService.updateProfile(this.user.id, {
      name: this.user.name,
      email: this.user.email,
      phone: this.user.phone
    }).subscribe(
      (data) => {
        this.edit = false;
        this.showSuccess('Profile updated successfully');
        this.isLoading = false;
      }
    );
  }

  cancel(): void {
    this.edit = false;
    this.clearMessages();
    if (this.user?.id) {
      this.loadUserProfile(this.user.id);
    }
  }

  toggleOrders(): void {
    this.showOrders = !this.showOrders;
    
    if (this.showOrders && this.user?.id) {
      this.isLoading = true;
      // Pure HTTP call - backend handles everything
      this.orderService.getOrdersByUser(this.user.id).subscribe(
        (data) => {
          this.orders = data;
          this.isLoading = false;
        }
      );
    }
  }

  logout(): void {
    this.isLoading = true;
    
    // Pure HTTP call - backend handles everything
    this.authService.logout().subscribe(
      (data) => {
        this.router.navigate(['/login']);
        this.isLoading = false;
      }
    );
  }

  private validateUserData(): boolean {
    if (!this.user) {
      this.showError('User data is missing');
      return false;
    }

    if (!this.user.name || this.user.name.trim().length === 0) {
      this.showError('Name is required');
      return false;
    }

    if (!this.user.email || this.user.email.trim().length === 0) {
      this.showError('Email is required');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.showError('Please enter a valid email address');
      return false;
    }

    return true;
  }

  private showSuccess(message: string): void {
    this.statusMessage = message;
    this.statusType = 'success';
  }

  private showError(message: string): void {
    this.statusMessage = message;
    this.statusType = 'error';
  }

  private clearMessages(): void {
    this.statusMessage = '';
    this.statusType = '';
  }
}
