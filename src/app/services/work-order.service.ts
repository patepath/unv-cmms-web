import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type WorkOrderStatus = 'Open' | 'Assigned' | 'In progress' | 'Completed';

export type WorkOrder = {
  id: number;
  title: string;
  asset: string;
  priority: 'Low' | 'Medium' | 'High';
  assignee: string;
  status: WorkOrderStatus;
  scheduledDate: string;
  time: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable({ providedIn: 'root' })
export class WorkOrderService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/workOrder/`;

  get(): Observable<WorkOrder[]> {
    return this.http.get<WorkOrder[]>(this.url);
  }

  create(
    draft: Pick<
      WorkOrder,
      'title' | 'asset' | 'priority' | 'assignee' | 'status' | 'scheduledDate' | 'time'
    >,
  ): Observable<WorkOrder> {
    return this.http.post<WorkOrder>(this.url, draft);
  }

  update(id: number, draft: Partial<WorkOrder>): Observable<WorkOrder> {
    return this.http.put<WorkOrder>(`${this.url}${id}`, draft);
  }
}
