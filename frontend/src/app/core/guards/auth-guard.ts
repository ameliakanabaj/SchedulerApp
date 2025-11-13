import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Authentication } from '../services/auth/authentication';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private authService: Authentication,
        private router: Router) {}

    canActivate(): boolean {
        if (this.authService.isAuthenticated()) {
            return true;
        } else {
            this.router.navigate(['/landing']);
            return false;
        }
    }
}
