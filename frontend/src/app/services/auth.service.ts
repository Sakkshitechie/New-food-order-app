import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { User } from '../Models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/users';
  private currentUserSubject!: BehaviorSubject<User | null>;
  public currentUser$!: Observable<User | null>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();
    const storedUser = this.getCurrentUserFromStorage();
    if (storedUser) {
        this.currentUserSubject.next(storedUser);
    } else {
        return;
    }
  }

  private getCurrentUserFromStorage(): User | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userData = localStorage.getItem('currentUser');
      const token = localStorage.getItem('accessToken');
      if (userData && token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          const isExpired = payload.exp < currentTime;
          if (!isExpired) {
            let user = JSON.parse(userData);
            if (!user.id && user._id) {
              user.id = user._id;
            }
            return user;
          }
      }
    }
    return null;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject?.value || null;
  }

  get isLoggedIn(): boolean {
    const user = this.currentUserSubject?.value;
    let hasToken = false;
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('accessToken');
      hasToken = token !== null;
    }
    return !!user && hasToken;
  }

  get isAuthenticated(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return false;
    }
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) {
        return true;
      }
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < currentTime;
      return !isExpired;
    } catch (error) {
      return false;
    }
  }

  login(email: string, password: string): Observable<any> {
    const credentials = { email, password };
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
  setCurrentUser(user: User, accessToken: string, refreshToken?: string): void {
    if (!user || !accessToken) {
      return;
    }
    let userToStore = { ...user };
    if (!userToStore.id && userToStore._id) {
      userToStore.id = userToStore._id;
    }
    localStorage.setItem('currentUser', JSON.stringify(userToStore));
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    if (this.currentUserSubject) {
      this.currentUserSubject.next(userToStore);
    }
  }

  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers: this.getAuthHeaders() });
  }

  clearCurrentUser(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    if (this.currentUserSubject) {
      this.currentUserSubject.next(null);
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }
  getRefreshToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }
  getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    if (token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
  handleAuthError(): void {
    this.clearCurrentUser();
  }
  getUserById(id: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, { headers: this.getAuthHeaders() });
  }
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { headers: this.getAuthHeaders() });
  }
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
  updateProfile(profileData: any): Observable<any> {
    return this.http.put<{ user: User }>(`${this.apiUrl}/profile`,profileData,{ headers: this.getAuthHeaders() });
  }
}
