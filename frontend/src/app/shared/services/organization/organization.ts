import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, tap } from 'rxjs';
import { OrganizationModel } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class Organization {
    private readonly organizationUrl = `${environment.apiUrl}/organizations`

    private readonly http = inject(HttpClient);

    getAll(): Observable<OrganizationModel[]> {
        return this.http.get<OrganizationModel[]>(this.organizationUrl);
    }

    getById(id: number): Observable<Organization> {
        return this.http.get<Organization>(`${this.organizationUrl}/${id}`);
    }

    create(name: string): Observable<any> {
        return this.http.post<{ organization: Organization, token: string}>(this.organizationUrl, { name }).pipe(
            tap((res) => localStorage.setItem('authToken', res.token)
        ));
    }

    update(id: number, name: string): Observable<Organization> {
        return this.http.put<Organization>(`${this.organizationUrl}/${id}`, { name });
    }

    delete(id: number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.organizationUrl}/${id}`);
    }

    getByIds(ids: number[]): Observable<Organization[]> {
        const params = ids.map(id => `ids=${id}`).join('&');
        return this.http.get<Organization[]>(`${this.organizationUrl}/?${params}`);
    }
}
