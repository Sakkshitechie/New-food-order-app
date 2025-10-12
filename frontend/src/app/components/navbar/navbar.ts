import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { User } from '../../Models/User';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, FormsModule], // Add FormsModule here
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  isOpen = false;
  currentUser: User | null = null;
  cartItemCount: number = 0;

  constructor(
    private authService: AuthService, 
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      
      if (user?.id) {
        this.loadCartCount();
      }
    });
    
    this.cartService.cartItems$.subscribe(items => {
      this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
    });
  }

  private async loadCartCount() {
    if (!this.currentUser || !this.currentUser.id) return;
    
    try {
      const cartItems = await firstValueFrom(this.cartService.getCart(this.currentUser.id));
      if (Array.isArray(cartItems)) {
        this.cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
      }
    } catch (error) {
      this.cartItemCount = 0;
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  get username(): string {
    return this.currentUser?.name || 'User';
  }

  async logout() {
    try {
      await firstValueFrom(this.authService.logout());
      this.authService.clearCurrentUser();
      this.router.navigate(['/']);
    } catch (error) {
      this.authService.clearCurrentUser();
      this.router.navigate(['/']);
    }
  }
}
