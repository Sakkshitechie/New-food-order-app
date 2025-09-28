import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../Models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/users';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getCurrentUserFromStorage(): User | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userData = localStorage.getItem('currentUser');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.currentUserValue !== null;
  }

  // Pure HTTP POST for login
  login(email: string, password: string): Observable<any> {
    const credentials = { email, password };
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // Set user data after successful login
  setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // Pure HTTP POST for register
  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // Pure HTTP POST for logout
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }

  // Clear user data after logout
  clearCurrentUser(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // Pure HTTP PUT for update profile
  updateProfile(userId: string | number, userData: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, userData);
  }

  // Pure HTTP GET for user by ID
  getUserById(id: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Pure HTTP GET for current user
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  // Pure HTTP GET for all users
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // Pure HTTP DELETE for delete user
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
