import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment.developement';
import { catchError, Observable, throwError } from 'rxjs';
import { Toastr } from '@app/shared/services';
import { UserModel } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class User {
    private readonly userUrl = `${environment.apiUrl}/users`;

    private readonly http = inject(HttpClient);

    getAll(): Observable<UserModel[]> {
        return this.http.get<UserModel[]>(this.userUrl);
    }

    getById(id: number): Observable<UserModel> {
        return this.http.get<UserModel>(`${this.userUrl}/${id}`);
    }

    getByOrganization(orgId: number): Observable<UserModel[]> {
        return this.http.get<UserModel[]>(`${this.userUrl}/organization/${orgId}`);
    }

    create(userData: Partial<UserModel>): Observable<{ user: UserModel; token?: string }> {
        return this.http.post<{ user: UserModel; token?: string }>(this.userUrl, userData);
    }

    update(id: number, userData: Partial<UserModel>): Observable<UserModel> {
        return this.http.put<UserModel>(`${this.userUrl}/${id}`, userData);
    }

    delete(id: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.userUrl}/${id}`);
    }
}
