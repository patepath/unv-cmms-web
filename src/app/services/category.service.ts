import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { Category } from '../interface';
import { Observable } from 'rxjs';

const apiURL = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly http = inject(HttpClient);

  get(): Observable<Category[]> {
    return this.http.get<Category[]>(`${apiURL}/category/`);
  }
}
