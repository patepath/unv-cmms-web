import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

type CalendarView = 'week' | 'month';
type WorkOrderStatus = 'Open' | 'Assigned' | 'In progress' | 'Completed';
type CalendarDay = {
  date: Date;
  key: string;
  number: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

type WorkOrder = {
  id: string;
  title: string;
  asset: string;
  priority: 'Low' | 'Medium' | 'High';
  assignee: string;
  status: WorkOrderStatus;
  scheduledDate: string;
  time: string;
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
  private readonly today = new Date();

  protected readonly weekdays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  protected readonly technicians = ['Unassigned', 'Narin K.', 'Mali P.', 'Somchai T.'];
  protected readonly view = signal<CalendarView>('month');
  protected readonly visibleDate = signal(new Date());
  protected readonly selectedDate = signal(this.dateKey(new Date()));
  protected readonly isFormOpen = signal(false);
  protected readonly workOrders = signal<WorkOrder[]>([
    {
      id: 'WO-1048',
      title: 'Inspect cooling system vibration',
      asset: 'HVAC / Building A',
      priority: 'High',
      assignee: 'Narin K.',
      status: 'In progress',
      scheduledDate: this.dateKey(this.today),
      time: '09:00',
    },
    {
      id: 'WO-1047',
      title: 'Replace worn conveyor belt',
      asset: 'Line 03 / Workshop',
      priority: 'Medium',
      assignee: 'Mali P.',
      status: 'Assigned',
      scheduledDate: this.dateKey(this.addDays(this.today, 2)),
      time: '13:30',
    },
    {
      id: 'WO-1046',
      title: 'Repair loading dock sensor',
      asset: 'Dock 02 / Warehouse',
      priority: 'Low',
      assignee: 'Somchai T.',
      status: 'Completed',
      scheduledDate: this.dateKey(this.addDays(this.today, -1)),
      time: '10:00',
    },
  ]);

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
    this.requestForm.patchValue({ date: day.key });
    this.isFormOpen.set(true);
  }

  protected openForm(): void {
    this.requestForm.patchValue({ date: this.selectedDate(), time: '09:00' });
    this.isFormOpen.set(true);
  }

  protected closeForm(): void {
    this.isFormOpen.set(false);
  }

  protected createWorkOrder(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const value = this.requestForm.getRawValue();
    const current = this.workOrders();
    this.workOrders.set([
      ...current,
      {
        id: `WO-${1049 + current.length}`,
        title: value.title.trim(),
        asset: value.asset.trim(),
        priority: value.priority,
        assignee: value.assignee,
        status: value.assignee === 'Unassigned' ? 'Open' : 'Assigned',
        scheduledDate: value.date,
        time: value.time,
      },
    ]);
    this.selectedDate.set(value.date);
    this.isFormOpen.set(false);
    this.requestForm.reset({
      title: '',
      asset: '',
      date: value.date,
      time: '09:00',
      priority: 'Medium',
      assignee: 'Unassigned',
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

  protected advanceStatus(order: WorkOrder): void {
    const nextStatuses: Record<WorkOrderStatus, WorkOrderStatus> = {
      Open: 'Assigned',
      Assigned: 'In progress',
      'In progress': 'Completed',
      Completed: 'Completed',
    };
    this.workOrders.update((orders) =>
      orders.map((current) =>
        current.id === order.id ? { ...current, status: nextStatuses[current.status] } : current,
      ),
    );
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

  private addDays(date: Date, amount: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
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
