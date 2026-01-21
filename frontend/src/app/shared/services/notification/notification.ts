import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { NotificationModel } from '@app/models/notification.model';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Notification {
    private readonly API_URL = `${environment.apiUrl}/notifications`;
    private readonly http = inject(HttpClient);

    getMyNotifications(): Observable<NotificationModel[]> {
        return this.http.get<NotificationModel[]>(`${this.API_URL}`);
    }    

    markAsRead(notificationId: number): Observable<NotificationModel> {
        return this.http.patch<NotificationModel>(`${this.API_URL}/${notificationId}/read`, {});
    }
}
