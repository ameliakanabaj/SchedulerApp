import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment.developement';
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

    logout(): void {
        localStorage.removeItem('authToken');
    }

    getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    isAuthenticated(): boolean {
        return this.getToken() !== null;
    }
}
