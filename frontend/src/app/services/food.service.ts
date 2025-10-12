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
  getFoodItems(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }
  getFoodById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  searchFoods(searchTerm: string): Observable<any> {
    return this.http.get(`${this.apiUrl}?search=${searchTerm}`);
  }
  createFood(food: FoodItem): Observable<any> {
    return this.http.post(`${this.apiUrl}`, food);
  }

  updateFood(id: number, food: FoodItem): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, food);
  }
  deleteFood(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
