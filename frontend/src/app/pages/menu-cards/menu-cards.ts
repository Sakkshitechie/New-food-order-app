import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodItem } from '../../Models/FoodItem';
import { CartItem } from '../../Models/CartItem';
import { FoodService } from '../../services/food.service';
import { CartService } from '../../services/cart.service'; 
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-cards',
  imports: [CommonModule],
  templateUrl: './menu-cards.html',
  styleUrl: './menu-cards.css'
})
export class MenuCards implements OnInit, AfterViewInit {
  @Input() items: FoodItem[] = [];
  foodItems: FoodItem[] = [];
  isLoggedIn: boolean = false;
  cartItems: CartItem[] = [];
  showViewCart:boolean=false;

  constructor(
    private foodService: FoodService,
    private cartService: CartService,
    private authService: AuthService,
    public router: Router
  ) {}

  addToCart(food: FoodItem) {
    const cartItem: CartItem = {
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
      quantity: 1,
      description: food.description,
      type: 'main-course' 
    };
    
    // Pure HTTP call - backend handles everything  
    const userId = 1; // Default user ID for demo
    this.cartService.addToCart(userId, cartItem).subscribe(
      (data) => {
        // Cart updated
      }
    );
  }

  goToOrder() {
    if(this.cartItems.length>0){
      this.router.navigate(['/order'],{state:{cartItems:this.cartItems}});
    }
  }

  ngOnInit() {
    this.cartItems = [];
    this.showViewCart = false;

    if (this.items.length === 0) {
      // Pure HTTP call - backend handles everything
      this.foodService.getFoodItems().subscribe(
        (data) => {
          this.foodItems = data;
        }
      );
    } else {
      this.foodItems = this.items;
    }
  }

  ngAfterViewInit() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  getCartItemQuantity(foodId: number): number {
    const item = this.cartItems.find(ci => ci.id === foodId);
    return item ? item.quantity : 0;
  }

  removeFromCart(foodId: number) {
    const userId = 1; // Default user ID for demo
    this.cartService.removeFromCart(userId, foodId).subscribe(
      (data) => {
        // Item removed
      }
    );
  }

  changeQuantity(foodId: number, delta: number) {
    const userId = 1; // Default user ID for demo
    this.cartService.updateQuantity(userId, foodId, delta).subscribe(
      (data) => {
        // Quantity updated
      }
    );
  }

  changeQty(foodId: number, delta: number) {
    this.changeQuantity(foodId, delta);
  }

  isInCart(foodId: number): boolean {
    return this.cartItems.some(item => item.id === foodId);
  }
}
