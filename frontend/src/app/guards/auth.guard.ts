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

    if (isLoggedIn && isAuthenticated) {
      return true;
    }

    // Redirect to login with query parameters for error message and return URL
    this.router.navigate(['/login'], { 
      queryParams: { 
        returnUrl: state.url, 
        authError: 'Access denied. Please log in to continue.' 
      } 
    });

    return false;
  }
}