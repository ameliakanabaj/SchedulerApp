import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { ShiftModel } from '@app/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Shift {
    private readonly API_URL = `${environment.apiUrl}/shifts`;

    private readonly http = inject(HttpClient);

    createShift(shift: ShiftModel): Observable<any> {
        return this.http.post(`${this.API_URL}`, shift);
    }

    createBulk(shifts: ShiftModel[]): Observable<any> {
        return this.http.post(`${this.API_URL}/bulk`, shifts);
    }

    getAllShifts(): Observable<ShiftModel[]> {
        return this.http.get<ShiftModel[]>(`${this.API_URL}`);
    }

    getMyShifts(): Observable<ShiftModel[]> {
        return this.http.get<ShiftModel[]>(`${this.API_URL}/mine`);
    }

    getShiftById(id: number): Observable<ShiftModel> {
        return this.http.get<ShiftModel>(`${this.API_URL}/${id}`);
    }

    updateShift(id: number, updates: Partial<ShiftModel>): Observable<any> {
        return this.http.patch(`${this.API_URL}/${id}`, updates);
    }

    deleteShift(id: number): Observable<any> {
        return this.http.delete(`${this.API_URL}/${id}`);
    }
}
