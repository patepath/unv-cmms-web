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

  getByCategory(categoryId: number): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${environment.apiUrl}/brand/category/${categoryId}`);
  }

  getById(id: number): Observable<Brand> {
    return this.http.get<Brand>(`${environment.apiUrl}/brand/${id}`);
  }

  create(brand: { category_id: number | null; name: string }): Observable<Brand> {
    return this.http.post<Brand>(`${environment.apiUrl}/brand/`, brand);
  }

  update(id: number, brand: { category_id: number | null; name: string }): Observable<Brand> {
    return this.http.put<Brand>(`${environment.apiUrl}/brand/${id}`, brand);
  }
}
