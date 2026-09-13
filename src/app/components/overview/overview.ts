import { ChangeDetectionStrategy, Component } from '@angular/core';

type WorkOrderSlice = {
  label: string;
  value: number;
  color: string;
  dashArray: string;
  dashOffset: number;
};

type HealthMetric = {
  label: string;
  value: number;
  color: string;
};

@Component({
  selector: 'app-overview',
  imports: [],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Overview {
  protected readonly workOrderSlices: WorkOrderSlice[] = [
    { label: 'Completed', value: 58, color: '#4a7739', dashArray: '58 42', dashOffset: 0 },
    { label: 'In progress', value: 24, color: '#fa4616', dashArray: '24 76', dashOffset: -58 },
    { label: 'Open', value: 18, color: '#d9a52d', dashArray: '18 82', dashOffset: -82 },
  ];
  protected readonly assetHealth: HealthMetric[] = [
    { label: 'Operational', value: 82, color: '#4a7739' },
    { label: 'Needs attention', value: 13, color: '#d9a52d' },
    { label: 'Out of service', value: 5, color: '#fa4616' },
  ];
  protected readonly maintenanceTrend = [42, 56, 49, 68, 61, 77, 72];
  protected readonly maintenanceLabels = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
}
