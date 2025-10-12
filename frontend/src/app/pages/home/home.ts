import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FoodItem } from '../../Models/FoodItem';
import { FoodService } from '../../services/food.service';
import { MenuCards } from '../menu-cards/menu-cards';
import { ActivatedRoute } from '@angular/router';
import { FilterPipe } from "../../pipes/filter.pipe";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MenuCards, FilterPipe, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  foodItems: FoodItem[] = [];
  searchTerm: string = '';

  constructor(private foodService: FoodService, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((queryParams) => {
      if (queryParams['search']) {
        this.searchTerm = queryParams['search'];
      }
    });

    this.foodService.getFoodItems().subscribe((data) => {
      this.foodItems = data;
    });
  }
}
