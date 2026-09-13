import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

type WorkOrderStatus = 'Open' | 'Assigned' | 'In progress' | 'Completed';

type WorkOrder = {
  id: string;
  title: string;
  asset: string;
  priority: 'Low' | 'Medium' | 'High';
  assignee: string;
  status: WorkOrderStatus;
  created: string;
};

@Component({
  selector: 'app-work-orders',
  imports: [ReactiveFormsModule],
  templateUrl: './work-orders.html',
  styleUrl: './work-orders.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkOrders {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly statuses: Array<'All' | WorkOrderStatus> = [
    'All',
    'Open',
    'Assigned',
    'In progress',
    'Completed',
  ];
  protected readonly technicians = ['Unassigned', 'Narin K.', 'Mali P.', 'Somchai T.'];
  protected readonly selectedStatus = signal<'All' | WorkOrderStatus>('All');
  protected readonly workOrders = signal<WorkOrder[]>([
    {
      id: 'WO-1048',
      title: 'Inspect cooling system vibration',
      asset: 'HVAC / Building A',
      priority: 'High',
      assignee: 'Narin K.',
      status: 'In progress',
      created: 'Today, 09:42',
    },
    {
      id: 'WO-1047',
      title: 'Replace worn conveyor belt',
      asset: 'Line 03 / Workshop',
      priority: 'Medium',
      assignee: 'Mali P.',
      status: 'Assigned',
      created: 'Yesterday, 16:20',
    },
    {
      id: 'WO-1046',
      title: 'Repair loading dock sensor',
      asset: 'Dock 02 / Warehouse',
      priority: 'Low',
      assignee: 'Somchai T.',
      status: 'Completed',
      created: 'Yesterday, 11:05',
    },
  ]);
  protected readonly filteredWorkOrders = computed(() => {
    const status = this.selectedStatus();
    return status === 'All'
      ? this.workOrders()
      : this.workOrders().filter((workOrder) => workOrder.status === status);
  });
  protected readonly requestForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    asset: ['', Validators.required],
    priority: ['Medium' as WorkOrder['priority'], Validators.required],
    assignee: ['Unassigned', Validators.required],
  });

  protected setStatus(status: 'All' | WorkOrderStatus): void {
    this.selectedStatus.set(status);
  }

  protected createWorkOrder(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const value = this.requestForm.getRawValue();
    const assignee = value.assignee;
    this.workOrders.update((workOrders) => [
      {
        id: `WO-${1050 + workOrders.length}`,
        title: value.title,
        asset: value.asset,
        priority: value.priority,
        assignee,
        status: assignee === 'Unassigned' ? 'Open' : 'Assigned',
        created: 'Just now',
      },
      ...workOrders,
    ]);
    this.requestForm.reset({ title: '', asset: '', priority: 'Medium', assignee: 'Unassigned' });
  }

  protected advanceStatus(id: string): void {
    this.workOrders.update((workOrders) =>
      workOrders.map((workOrder) => ({
        ...workOrder,
        status: workOrder.id === id ? this.nextStatus(workOrder.status) : workOrder.status,
      })),
    );
  }

  private nextStatus(status: WorkOrderStatus): WorkOrderStatus {
    const nextStatuses: Record<WorkOrderStatus, WorkOrderStatus> = {
      Open: 'Assigned',
      Assigned: 'In progress',
      'In progress': 'Completed',
      Completed: 'Completed',
    };
    return nextStatuses[status];
  }
}
