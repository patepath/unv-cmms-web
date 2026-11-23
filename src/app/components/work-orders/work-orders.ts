import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { WorkOrder, WorkOrderService, WorkOrderStatus } from '../../services/work-order.service';

type CalendarView = 'week' | 'month';
type CalendarDay = {
  date: Date;
  key: string;
  number: number;
  isCurrentMonth: boolean;
  isToday: boolean;
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
  private readonly workOrderService = inject(WorkOrderService);
  private readonly today = new Date();

  protected readonly weekdays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  protected readonly technicians = ['Unassigned', 'Narin K.', 'Mali P.', 'Somchai T.'];
  protected readonly view = signal<CalendarView>('month');
  protected readonly visibleDate = signal(new Date());
  protected readonly selectedDate = signal(this.dateKey(new Date()));
  protected readonly isFormOpen = signal(false);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly editingOrderId = signal<number | null>(null);
  protected readonly workOrders = signal<WorkOrder[]>([]);

  protected readonly requestForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    asset: ['', Validators.required],
    date: [this.dateKey(this.today), Validators.required],
    time: ['09:00', Validators.required],
    priority: ['Medium' as WorkOrder['priority'], Validators.required],
    assignee: ['Unassigned', Validators.required],
  });

  protected readonly calendarTitle = computed(() =>
    new Intl.DateTimeFormat('th-TH', {
      month: 'long',
      year: 'numeric',
      ...(this.view() === 'week' ? { day: 'numeric' as const } : {}),
    }).format(this.visibleDate()),
  );

  protected readonly calendarDays = computed(() => {
    const current = this.visibleDate();
    const start =
      this.view() === 'month'
        ? this.startOfWeek(new Date(current.getFullYear(), current.getMonth(), 1))
        : this.startOfWeek(current);
    return Array.from({ length: this.view() === 'month' ? 42 : 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return {
        date,
        key: this.dateKey(date),
        number: date.getDate(),
        isCurrentMonth: date.getMonth() === current.getMonth(),
        isToday: this.dateKey(date) === this.dateKey(new Date()),
      };
    });
  });

  protected readonly selectedOrders = computed(() =>
    this.ordersForDate(this.selectedDate()).sort((a, b) => a.time.localeCompare(b.time)),
  );

  constructor() {
    this.loadWorkOrders();
  }

  protected setView(view: CalendarView): void {
    this.view.set(view);
  }

  protected previousPeriod(): void {
    this.movePeriod(-1);
  }

  protected nextPeriod(): void {
    this.movePeriod(1);
  }

  protected goToToday(): void {
    this.visibleDate.set(new Date());
    this.selectedDate.set(this.dateKey(new Date()));
  }

  protected selectDay(day: CalendarDay): void {
    this.selectedDate.set(day.key);
    this.visibleDate.set(day.date);
  }

  protected createForDay(day: CalendarDay): void {
    this.selectedDate.set(day.key);
    this.visibleDate.set(day.date);
    this.openForm(day.key);
  }

  protected editOrder(order: WorkOrder, event?: Event): void {
    event?.stopPropagation();
    this.editingOrderId.set(order.id);
    this.selectedDate.set(order.scheduledDate);
    this.requestForm.patchValue({
      title: order.title,
      asset: order.asset,
      date: order.scheduledDate,
      time: order.time,
      priority: order.priority,
      assignee: order.assignee,
    });
    this.isFormOpen.set(true);
  }

  protected openForm(date = this.selectedDate()): void {
    this.editingOrderId.set(null);
    this.requestForm.reset({
      title: '',
      asset: '',
      date,
      time: '09:00',
      priority: 'Medium',
      assignee: 'Unassigned',
    });
    this.isFormOpen.set(true);
  }

  protected closeForm(): void {
    this.isFormOpen.set(false);
    this.editingOrderId.set(null);
  }

  protected createWorkOrder(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const value = this.requestForm.getRawValue();
    this.isSaving.set(true);
    this.errorMessage.set('');
    const draft = {
      title: value.title.trim(),
      asset: value.asset.trim(),
      priority: value.priority,
      assignee: value.assignee,
      status:
        this.editingOrderId() === null
          ? value.assignee === 'Unassigned'
            ? ('Open' as const)
            : ('Assigned' as const)
          : (this.workOrders().find((order) => order.id === this.editingOrderId())?.status ??
            ('Open' as const)),
      scheduledDate: value.date,
      time: value.time,
    };
    const editingId = this.editingOrderId();
    const request =
      editingId === null
        ? this.workOrderService.create(draft)
        : this.workOrderService.update(editingId, draft);

    request.subscribe({
      next: (workOrder) => {
        this.workOrders.update((orders) => [
          ...orders.filter((current) => current.id !== workOrder.id),
          { ...workOrder, scheduledDate: workOrder.scheduledDate.slice(0, 10) },
        ]);
        this.selectedDate.set(value.date);
        this.visibleDate.set(this.parseDateKey(value.date));
        this.isSaving.set(false);
        this.isFormOpen.set(false);
        this.editingOrderId.set(null);
        this.requestForm.reset({
          title: '',
          asset: '',
          date: value.date,
          time: '09:00',
          priority: 'Medium',
          assignee: 'Unassigned',
        });
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.error ?? 'ไม่สามารถบันทึกใบสั่งงานได้');
        this.isSaving.set(false);
      },
    });
  }

  protected ordersForDate(date: string): WorkOrder[] {
    return this.workOrders().filter((workOrder) => workOrder.scheduledDate === date);
  }

  protected selectedDateLabel(): string {
    return new Intl.DateTimeFormat('th-TH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(this.parseDateKey(this.selectedDate()));
  }

  protected advanceStatus(order: WorkOrder, event?: Event): void {
    event?.stopPropagation();
    const nextStatuses: Record<WorkOrderStatus, WorkOrderStatus> = {
      Open: 'Assigned',
      Assigned: 'In progress',
      'In progress': 'Completed',
      Completed: 'Completed',
    };
    const status = nextStatuses[order.status];
    this.workOrderService.update(order.id, { status }).subscribe({
      next: (updatedOrder) =>
        this.workOrders.update((orders) =>
          orders.map((current) => (current.id === updatedOrder.id ? updatedOrder : current)),
        ),
      error: (error: HttpErrorResponse) =>
        this.errorMessage.set(error.error?.error ?? 'ไม่สามารถอัปเดตสถานะได้'),
    });
  }

  private movePeriod(direction: number): void {
    const date = new Date(this.visibleDate());
    if (this.view() === 'month') {
      date.setMonth(date.getMonth() + direction, 1);
    } else {
      date.setDate(date.getDate() + direction * 7);
    }
    this.visibleDate.set(date);
  }

  private startOfWeek(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    result.setDate(result.getDate() - result.getDay());
    return result;
  }

  private loadWorkOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.workOrderService.get().subscribe({
      next: (workOrders) => {
        const normalizedOrders = workOrders.map((workOrder) => ({
          ...workOrder,
          scheduledDate: workOrder.scheduledDate.slice(0, 10),
        }));
        this.workOrders.set(normalizedOrders);
        const nearestOrder = this.nearestWorkOrder(normalizedOrders);
        if (nearestOrder) {
          const date = this.parseDateKey(nearestOrder.scheduledDate);
          this.visibleDate.set(date);
          this.selectedDate.set(nearestOrder.scheduledDate);
        }
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.error ?? 'ไม่สามารถโหลดใบสั่งงานได้');
        this.isLoading.set(false);
      },
    });
  }

  private nearestWorkOrder(workOrders: WorkOrder[]): WorkOrder | undefined {
    const todayKey = this.dateKey(new Date());
    const sorted = [...workOrders].sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
    return sorted.find((workOrder) => workOrder.scheduledDate >= todayKey) ?? sorted.at(-1);
  }

  private dateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;
  }

  private parseDateKey(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
