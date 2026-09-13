import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Location } from '../interface';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly apiURL = environment.apiUrl;

  get(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiURL}/location/`);
  }
}
