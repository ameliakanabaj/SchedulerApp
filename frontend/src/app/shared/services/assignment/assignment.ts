import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AssignmentModel } from '@app/models/assignment.model';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Assignment {
    API_URL = `${environment.apiUrl}/assignments`;

    private readonly http = inject(HttpClient);

    createAssignment(data: AssignmentModel): Observable<any> {
        return this.http.post(`${this.API_URL}`, data);
    }

    getAssignmentsByUser(userId: string): Observable<AssignmentModel[]> {
        return this.http.get<AssignmentModel[]>(`${this.API_URL}/user/${userId}`);
    }

    updateAssignment(id: number, updates: Partial<AssignmentModel>): Observable<any> {
        return this.http.patch(`${this.API_URL}/${id}`, updates);
    }

    deleteAssignment(id: number): Observable<any> {
        return this.http.delete(`${this.API_URL}/${id}`);
    }
}
