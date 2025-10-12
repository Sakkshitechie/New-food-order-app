import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../Models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/users';
  public currentUserSubject!: BehaviorSubject<User | null>;
  public currentUser$!: Observable<User | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject?.value || null;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject?.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject?.value;
  }

  login(email: string, password: string): Observable<any> {
    const credentials = { email, password };
    return this.http.post(`${this.apiUrl}/login`, credentials, { withCredentials: true });
  }

  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }

  getUserById(id: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, { withCredentials: true });
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { withCredentials: true });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put<{ user: User }>(`${this.apiUrl}/profile`, profileData, { withCredentials: true });
  }

  clearCurrentUser(): void {
  this.currentUserSubject.next(null);
  }

  handleAuthError(): void {
  this.clearCurrentUser();
  }
}
