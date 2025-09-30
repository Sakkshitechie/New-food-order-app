import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { User } from '../Models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/users';
  private currentUserSubject!: BehaviorSubject<User | null>;
  public currentUser$!: Observable<User | null>;

  constructor(private http: HttpClient) {
    // Initialize with null first to avoid issues during getCurrentUserFromStorage
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();
    // Load user from storage after initialization
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
        try {
          // Check token expiry manually during initialization
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
        } catch (error) {
          // Token is invalid, just return null
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
      // Parse JWT token
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }
      const payload = JSON.parse(atob(parts[1]));
      // If no exp field, assume token is valid (shouldn't happen with proper JWT)
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

  // Login with JWT token handling
  login(email: string, password: string): Observable<any> {
    const credentials = { email, password };
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // Set user data and tokens after successful login
  setCurrentUser(user: User, accessToken: string, refreshToken?: string): void {
    if (!user || !accessToken) {
      return;
    }
    // Always ensure user has an id field for persistence
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

  // Register new user
  register(user: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  // Logout with token cleanup
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers: this.getAuthHeaders() });
  }

  // Clear user data and tokens after logout
  clearCurrentUser(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    if (this.currentUserSubject) {
      this.currentUserSubject.next(null);
    }
  }

  // Get access token
  getAccessToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  // Get refresh token
  getRefreshToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  // Get authorization headers
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

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  // Handle authentication errors
  handleAuthError(): void {
    this.clearCurrentUser();
  }

  // Update profile with authentication
  updateProfile(userId: string | number, userData: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}`, userData, { headers: this.getAuthHeaders() });
  }

  // Get user by ID with authentication
  getUserById(id: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  // Get current user with authentication
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, { headers: this.getAuthHeaders() });
  }

  // Get all users with authentication
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { headers: this.getAuthHeaders() });
  }

  // Delete user with authentication
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
