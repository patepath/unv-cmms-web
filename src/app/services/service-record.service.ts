import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type ServiceRecord = {
  id: number;
  assetId: number;
  recordType: 'OM' | 'PM';
  serviceDate: string;
  endDate?: string | null;
  details: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable({ providedIn: 'root' })
export class ServiceRecordService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/serviceRecord/`;

  get(type: 'OM' | 'PM'): Observable<ServiceRecord[]> {
    return this.http.get<ServiceRecord[]>(this.url, { params: { type } });
  }

  create(
    draft: Pick<ServiceRecord, 'assetId' | 'recordType' | 'serviceDate' | 'details'> &
      Partial<Pick<ServiceRecord, 'endDate'>>,
  ) {
    return this.http.post<ServiceRecord>(this.url, draft);
  }

  createRepeated(
    draft: Pick<ServiceRecord, 'assetId' | 'recordType' | 'serviceDate' | 'details'> & {
      repeatInterval: string;
      repeatCount: number;
    },
  ): Observable<ServiceRecord[]> {
    return this.http.post<ServiceRecord[]>(`${this.url}repeat`, draft);
  }

  update(
    id: number,
    draft: Pick<ServiceRecord, 'assetId' | 'recordType' | 'serviceDate' | 'details'> &
      Partial<Pick<ServiceRecord, 'endDate'>>,
  ): Observable<ServiceRecord> {
    return this.http.put<ServiceRecord>(`${this.url}${id}`, draft);
  }
}
