import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuth {
  private readonly apiUrl = `${environment.apiUrl}/auth/google`;
  private readonly http = inject(HttpClient);

  getConnectUrl(): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.apiUrl}/connect`);
  }

  disconnect(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/disconnect`);
  }
}
