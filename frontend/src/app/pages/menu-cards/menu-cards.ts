import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodItem } from '../../Models/FoodItem';
import { CartItem } from '../../Models/CartItem';
import { FoodService } from '../../services/food.service';
import { CartService } from '../../services/cart.service'; 
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FilterPipe } from "../../pipes/filter.pipe";

@Component({
  selector: 'app-menu-cards',
  imports: [CommonModule, FilterPipe],
  templateUrl: './menu-cards.html',
  styleUrl: './menu-cards.css'
})
export class MenuCards implements OnInit, AfterViewInit {
  @Input() items: FoodItem[] = [];
  @Input() searchTerm: string = ''; 
  foodItems: FoodItem[] = [];
  cartItems: CartItem[] = [];
  showViewCart: boolean = false;
  private currentUserId: number | string | null = null;
  isLoggedIn: boolean = false;
  bootstrap: any;
  errorMessage: string = '';

  constructor(
    private foodService: FoodService,
    private cartService: CartService,
    private authService: AuthService,
    public router: Router
  ) {}

  addToCart(food: FoodItem) {
    if (!this.isLoggedIn || !this.currentUserId) {
      this.errorMessage = 'You must be logged in to add items to the cart.';
      this.router.navigate(['/login']);
      return;
    }
    const userId = String(this.currentUserId);
    const cartData = {
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image
    };
    this.cartService.addToCart(userId, cartData).subscribe({
      next: () => {
        this.errorMessage = ''; 
        this.loadCartItems();
      },
      error: (error) => {
         if (error.status === 401) {
          this.errorMessage = 'Session expired or unauthorized. Please log in again.';
          this.authService.handleAuthError();
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = 'Failed to add item to cart. Please try again.';
        }
      }
    });
  }

  goToOrder() {
    if (this.cartItems.length > 0) {
      this.router.navigate(['/order'], { state: { cartItems: this.cartItems } });
    }
  }

  ngOnInit() {
    this.cartItems = [];
    this.showViewCart = false;

    this.authService.currentUser$.subscribe(currentUser => {
      let userId = null;
      if (currentUser) {
        userId = currentUser.id || currentUser._id || null;
      }
      this.currentUserId = userId;
      this.isLoggedIn = !!userId;
      this.loadCartItems();
      setTimeout(() => this.initializeTooltips(), 100);
    });

    if (this.items.length === 0) {
      this.foodService.getFoodItems().subscribe(data => {
        this.foodItems = data;
        setTimeout(() => this.initializeTooltips(), 200);
      });
    } else {
      this.foodItems = this.items;
      setTimeout(() => this.initializeTooltips(), 200);
    }
  }

  private loadCartItems() {
    if (!this.isLoggedIn || !this.currentUserId) {
      this.cartItems = [];
      this.showViewCart = false;
      this.cartService.updateCartItems([]);
      return;
    }
    const userId = String(this.currentUserId);
    this.cartService.getCart(userId).subscribe({
      next: (cartData) => {
        this.cartItems = Array.isArray(cartData) ? cartData : [];
        this.showViewCart = this.cartItems.length > 0;
        this.cartService.updateCartItems(this.cartItems);
      },
      error: (error) => {
        this.cartItems = [];
        this.showViewCart = false;
        this.cartService.updateCartItems([]);
      }
    });
  }

 ngAfterViewInit() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(function (tooltipTriggerEl) {
    new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
  });
}

  private initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      const existingTooltip = (window as any).bootstrap.Tooltip.getInstance(tooltipTriggerEl);
      if (existingTooltip) {
        existingTooltip.dispose();
      }
      return new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  getCartItemQuantity(foodId: number): number {
    const item = this.cartItems.find(ci => ci.id === foodId);
    return item ? item.quantity : 0;
  }

  removeFromCart(foodId: number) {
    if (!this.isLoggedIn || !this.currentUserId) return;
    const userId = String(this.currentUserId);
    this.cartService.removeFromCart(userId, foodId).subscribe(() => {
      this.loadCartItems();
    });
  }

  changeQuantity(foodId: number, newQuantity: number) {
    if (!this.isLoggedIn || !this.currentUserId) return;
    const userId = String(this.currentUserId);
    if (newQuantity <= 0) {
      this.removeFromCart(foodId);
    } else {
      this.cartService.updateQuantity(userId, foodId, newQuantity).subscribe(() => {
        this.loadCartItems();
      });
    }
  }

  changeQty(foodId: number, delta: number) {
    if (!this.isLoggedIn || !this.currentUserId) return;
    const currentQuantity = this.getCartItemQuantity(foodId);
    const newQuantity = currentQuantity + delta;
    this.changeQuantity(foodId, newQuantity);
  }

  isInCart(foodId: number): boolean {
    return this.cartItems.some(item => item.id === foodId);
  }
}
