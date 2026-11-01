import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Brand } from '../interface';

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private readonly http = inject(HttpClient);

  get(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${environment.apiUrl}/brand/`);
  }
}
