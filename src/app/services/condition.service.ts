import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { Condition } from '../interface';

const apiURL = environment.apiUrl;
@Injectable({
  providedIn: 'root',
})
export class ConditionService {
  private readonly http = inject(HttpClient);

  get(): Observable<Condition[]> {
    return of<Condition[]>([
      { id: '1', name: 'ใช้งานได้ปกติ' },
      { id: '2', name: 'ใช้งานได้แต่ต้องปรับปรุง' },
      { id: '3', name: 'ไม่ได้ใช้งาน' },
      { id: '4', name: 'ไม่สามารถใช้งานได้' }
    ]);
  }
}
