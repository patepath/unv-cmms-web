import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Building } from '../interface';

@Injectable({
  providedIn: 'root',
})
export class BuildingService {
  private readonly http = inject(HttpClient);

  get(): Observable<Building[]> {
    return this.http.get<Building[]>(`${environment.apiUrl}/building/`);
  }
}
