import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment.developement';
import { catchError, Observable, throwError } from 'rxjs';
import { Toastr } from '@app/shared/services';

@Injectable({
  providedIn: 'root'
})
export class User {
    private readonly userUrl = `${environment.apiUrl}/users`;

    private readonly http = inject(HttpClient);
    private readonly toastrService = inject(Toastr);

    getAll(): Observable<User[]> {
        return this.http.get<User[]>(this.userUrl).pipe(
            catchError(this.handleError)
        );
    }

    getById(id: number): Observable<User> {
        return this.http.get<User>(`${this.userUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    getByOrganization(orgId: number): Observable<User[]> {
        return this.http.get<User[]>(`${this.userUrl}/organization/${orgId}`).pipe(
            catchError(this.handleError)
        );
    }

    create(userData: any): Observable<{ user: User; token?: string }> {
        return this.http.post<{ user: User; token?: string }>(this.userUrl, userData).pipe(
            catchError(this.handleError)
        );
    }

    update(id: number, userData: any): Observable<User> {
        return this.http.put<User>(`${this.userUrl}/${id}`, userData).pipe(
            catchError(this.handleError)
        );
    }

    delete(id: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.userUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    resetPassword(current_password: string, new_password: string): Observable<any> {
        return this.http.post(`${this.userUrl}/change-password`, { current_password, new_password });
    }

    private handleError(error: any) {
        this.toastrService.error('Error at fetching user', error);
        return throwError(() => error);
    }
}
