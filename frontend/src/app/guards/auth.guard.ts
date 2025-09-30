import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    
    const isLoggedIn = this.authService.isLoggedIn;
    const isAuthenticated = this.authService.isAuthenticated;
    
    
    // Check if user is logged in and token is valid
    if (isLoggedIn && isAuthenticated) {
      return true;
    }

    // If logged in but not authenticated (e.g., expired token), clear auth data
    if (isLoggedIn && !isAuthenticated) {
      this.authService.handleAuthError();
    }

    // If not authenticated, redirect to login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    
    return false;
  }
}