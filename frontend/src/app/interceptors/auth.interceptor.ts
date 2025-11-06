import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Retrieve the token (replace with actual logic to get the token)
  const authToken = localStorage.getItem('authToken') || '';

  // Clone the request to add cookies and required headers
  const clonedRequest = req.clone({
    withCredentials: true, // Attach cookies
    setHeaders: {
      Authorization: `Bearer ${authToken}`, // Add Authorization header
      'Content-Type': 'application/json' // Ensure JSON content type
    }
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        router.navigate(['/login'], {
          queryParams: { authError: 'Your session has expired. Please log in again.' }
        });
      }
      return throwError(() => error);
    })
  );
};
