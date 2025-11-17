import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class Authentication {
    private readonly authUrl = `${environment.apiUrl}/auth`

    constructor(private http: HttpClient) {}

    login(credentials: { email: string; password: string }): Observable<any> {
        return this.http.post<{ token: string }>(`${this.authUrl}/login`, credentials).pipe(
            tap((res) => localStorage.setItem('authToken', res.token)
        ));
    }

    register(credentials: { first_name: string, last_name: string, email: string, password: string}): Observable<any> {
        return this.http.post(`${this.authUrl}/register`, credentials);
    }

    hasRole(role: string): boolean {
        const token = this.getToken();
        if (!token) {
            return false;
        }

        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.roles.includes(role);
    }

    logout(): void {
        localStorage.removeItem('authToken');
    }

    getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    getUserId(): string | null {
        const token = this.getToken();
        if (!token) {
            return null;
        }

        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
    }

    isAuthenticated(): boolean {
        return this.getToken() !== null;
    }
}
