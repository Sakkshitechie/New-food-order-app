import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodItem } from '../../Models/FoodItem';
import { FoodService } from '../../services/food.service';
import { MenuCards } from '../menu-cards/menu-cards';
import { FilterPipe } from '../../pipes/filter.pipe';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MenuCards, FilterPipe, FormsModule,RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  foodItems: FoodItem[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  
  constructor(private foodService: FoodService, private activatedRoute: ActivatedRoute) {
    this.activatedRoute.params.subscribe((params) => {
      if(params['searchTerm']) this.searchTerm = params['searchTerm'];
    });
    this.activatedRoute.queryParams.subscribe((queryParams) => {
      if(queryParams['search']) this.searchTerm = queryParams['search'];
    });
   }

  ngOnInit(): void {
    this.isLoading = true;
    
    // Pure HTTP call - backend handles everything
    this.foodService.getFoodItems().subscribe(
      (data) => {
        this.foodItems = data;
        this.isLoading = false;
      }
    );
  }
}
