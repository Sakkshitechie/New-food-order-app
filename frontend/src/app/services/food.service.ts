import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FoodItem } from '../Models/FoodItem';

@Injectable({
  providedIn: 'root'
})
export class FoodService {
  private apiUrl = 'http://localhost:3000/api/items';

  constructor(private http: HttpClient) {}
 
  // Pure HTTP GET for all food items
  getFoodItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // Pure HTTP GET for food item by ID
  getFoodById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Pure HTTP GET for foods by category
  getFoodsByCategory(category: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?category=${category}`);
  }

  // Pure HTTP GET for search foods
  searchFoods(searchTerm: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?search=${searchTerm}`);
  }

  // Pure HTTP POST for create food item
  createFood(food: FoodItem): Observable<any> {
    return this.http.post(`${this.apiUrl}`, food);
  }

  // Pure HTTP PUT for update food item
  updateFood(id: number, food: FoodItem): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, food);
  }

  // Pure HTTP DELETE for delete food item
  deleteFood(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
