import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');
  console.log('authGuard called for route:', state.url, 'token:', token);

  // Simple check: token exists
  if (token) {
    console.log('Auth guard: Access granted');
    return true;
  } else {
    console.log('Auth guard: Access denied, redirecting to login');
    const router = inject(Router);
    router.navigate(['/login']);
    return false;
  }
};
