import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment.developement';
import { Observable } from 'rxjs';
import { Organization as OrganizationModel } from '@app/models';

@Injectable({
  providedIn: 'root'
})
export class Organization {
    private readonly organizationUrl = `${environment.apiUrl}/organizations`

    private readonly http = inject(HttpClient);

    createOrganization(organization: { name: string }): void {
        this.http.post(`${this.organizationUrl}/`, organization);
    }

    getOrganization(id: string): Observable<OrganizationModel> {
        return this.http.get(`${this.organizationUrl}/${id}`);
    }

}
