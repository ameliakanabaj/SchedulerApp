import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ScheduleModel } from '@app/models/schedule.model';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Schedule {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = `${environment.apiUrl}/schedules`;

    getAllByOrganization(organizationId: number): Observable<ScheduleModel[]> {
        return this.http.get<ScheduleModel[]>(`${this.baseUrl}/organization/${organizationId}`);
    }

    getAllByUser(userId: number): Observable<ScheduleModel[]> {
        return this.http.get<ScheduleModel[]>(`${this.baseUrl}/user/${userId}`);
    }

    getById(scheduleId: number): Observable<ScheduleModel> {
        return this.http.get<ScheduleModel>(`${this.baseUrl}/${scheduleId}`);
    }

    create(payload: {
        organization_id: number;
        date_from: string;
        date_to: string;
        deadline_generate_date: string;
    }): Observable<ScheduleModel> {
        return this.http.post<ScheduleModel>(this.baseUrl, payload);
    }

    update(scheduleId: number, payload: Partial<ScheduleModel>): Observable<ScheduleModel> {
        return this.http.put<ScheduleModel>(`${this.baseUrl}/${scheduleId}`, payload);
    }

    delete(scheduleId: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/${scheduleId}`);
    }
}
