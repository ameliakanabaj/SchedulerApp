import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AvailabilityModel } from '@app/models/availability.model';
import { environment } from 'environments/environment.developement';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Availability {
    API_URL = `${environment}/availability`;

    private readonly http = inject(HttpClient);

    createAvailability(data: AvailabilityModel): Observable<any> {
        return this.http.post(`${this.API_URL}`, data);
    }

    getAvailabilityByUser(userId: string): Observable<AvailabilityModel[]> {
        return this.http.get<AvailabilityModel[]>(`${this.API_URL}/user/${userId}`);
    }

    updateAvailability(id: number, updates: Partial<AvailabilityModel>): Observable<any> {
        return this.http.patch(`${this.API_URL}/${id}`, updates);
    }

    deleteAvailability(id: number): Observable<any> {
        return this.http.delete(`${this.API_URL}/${id}`);
    }

    bulkCreateAvailability(userId: string, days: AvailabilityModel[]) {
        return this.http.post(`${this.API_URL}/bulk`, {
            user_id: userId,
            days
        });
    }
}
