import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment.developement';
import { catchError, Observable, throwError } from 'rxjs';
import { Organization as OrganizationModel } from '@app/models';
import { Toastr } from '@app/shared/services';

@Injectable({
  providedIn: 'root'
})
export class Organization {
    private readonly organizationUrl = `${environment.apiUrl}/organizations`

    private readonly http = inject(HttpClient);
    private readonly toastrService = inject(Toastr);

    getAll(): Observable<OrganizationModel[]> {
        return this.http.get<OrganizationModel[]>(this.organizationUrl).pipe(
            catchError(this.handleError)
        );
    }

    getById(id: number): Observable<Organization> {
        return this.http.get<Organization>(`${this.organizationUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    create(name: string): Observable<Organization> {
        return this.http.post<Organization>(this.organizationUrl, { name }).pipe(
            catchError(this.handleError)
        );
    }

    update(id: number, name: string): Observable<Organization> {
        return this.http.put<Organization>(`${this.organizationUrl}/${id}`, { name }).pipe(
            catchError(this.handleError)
        );
    }

    delete(id: number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.organizationUrl}/${id}`).pipe(
            catchError(this.handleError)
        );
    }

    getByIds(ids: number[]): Observable<Organization[]> {
        const params = ids.map(id => `ids=${id}`).join('&');
        return this.http.get<Organization[]>(`${this.organizationUrl}/?${params}`).pipe(
            catchError(this.handleError)
        );
    }

    private handleError(error: any) {
        this.toastrService.error('Error at fetching organization', error);
        return throwError(() => error);
    }

}
