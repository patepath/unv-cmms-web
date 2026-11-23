import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Asset } from '../../interface';
import { AssetService } from '../../services/asset.service';
import { ServiceRecord, ServiceRecordService } from '../../services/service-record.service';

type CalendarView = 'week' | 'month';

type CalendarDay = {
  date: Date;
  key: string;
  number: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

@Component({
  selector: 'app-operative-maintenance',
  imports: [ReactiveFormsModule],
  templateUrl: './operative-maintenance.html',
  styleUrl: './operative-maintenance.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperativeMaintenance {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly assetService = inject(AssetService);
  private readonly serviceRecordService = inject(ServiceRecordService);

  protected readonly weekdays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  protected readonly view = signal<CalendarView>('month');
  protected readonly visibleDate = signal(new Date());
  protected readonly selectedDate = signal(this.dateKey(new Date()));
  protected readonly assets = signal<Asset[]>([]);
  protected readonly records = signal<ServiceRecord[]>([]);
  protected readonly isFormOpen = signal(false);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly editingRecordId = signal<number | null>(null);

  protected readonly eventForm = this.formBuilder.nonNullable.group({
    assetId: [0, Validators.min(1)],
    date: [this.dateKey(new Date()), Validators.required],
    startTime: ['08:00', Validators.required],
    endTime: ['09:00', Validators.required],
    details: ['', [Validators.required, Validators.maxLength(300)]],
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
    const dayCount = this.view() === 'month' ? 42 : 7;

    return Array.from({ length: dayCount }, (_, index) => {
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

  protected readonly selectedRecords = computed(() =>
    this.recordsForDate(this.selectedDate()).sort((a, b) =>
      a.serviceDate.localeCompare(b.serviceDate),
    ),
  );

  protected readonly assetMap = computed(
    () => new Map(this.assets().map((asset) => [asset.id, asset])),
  );

  constructor() {
    this.loadAssets();
    this.loadRecords();
    const equipmentCode = this.route.snapshot.queryParamMap.get('equipmentCode');
    if (equipmentCode) {
      this.openFormForEquipment(equipmentCode);
    }
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
    const today = new Date();
    this.visibleDate.set(today);
    this.selectedDate.set(this.dateKey(today));
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

  protected editRecord(record: ServiceRecord, event?: Event): void {
    event?.stopPropagation();
    const start = new Date(record.serviceDate);
    const end = record.endDate ? new Date(record.endDate) : new Date(start.getTime() + 3600000);
    this.editingRecordId.set(record.id);
    this.selectedDate.set(this.dateKey(start));
    this.eventForm.patchValue({
      assetId: record.assetId,
      date: this.dateKey(start),
      startTime: this.timeInputValue(start),
      endTime: this.timeInputValue(end),
      details: record.details,
    });
    this.isFormOpen.set(true);
  }

  protected openForm(date = this.selectedDate()): void {
    this.editingRecordId.set(null);
    this.eventForm.patchValue({
      assetId: 0,
      date,
      startTime: '08:00',
      endTime: '09:00',
      details: '',
    });
    this.isFormOpen.set(true);
  }

  protected closeForm(): void {
    this.isFormOpen.set(false);
    this.editingRecordId.set(null);
  }

  protected saveEvent(): void {
    if (this.eventForm.invalid || this.isSaving()) {
      this.eventForm.markAllAsTouched();
      return;
    }

    const value = this.eventForm.getRawValue();
    if (value.endTime <= value.startTime) {
      this.errorMessage.set('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น');
      return;
    }
    this.isSaving.set(true);
    this.errorMessage.set('');
    const draft = {
      assetId: value.assetId,
      recordType: 'OM' as const,
      serviceDate: this.toISOString(value.date, value.startTime),
      endDate: this.toISOString(value.date, value.endTime),
      details: value.details.trim(),
    };
    const editingId = this.editingRecordId();
    const request =
      editingId === null
        ? this.serviceRecordService.create(draft)
        : this.serviceRecordService.update(editingId, draft);

    request.subscribe({
      next: (record) => {
        this.records.update((records) => [
          ...records.filter((current) => current.id !== record.id),
          record,
        ]);
        this.selectedDate.set(value.date);
        this.visibleDate.set(this.parseDateKey(value.date));
        this.isSaving.set(false);
        this.isFormOpen.set(false);
        this.editingRecordId.set(null);
        this.eventForm.patchValue({ details: '' });
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.error ?? 'ไม่สามารถบันทึกงาน OM ได้');
        this.isSaving.set(false);
      },
    });
  }

  protected recordsForDate(date: string): ServiceRecord[] {
    return this.records().filter((record) => this.dateKey(new Date(record.serviceDate)) === date);
  }

  protected assetLabel(record: ServiceRecord): string {
    const asset = this.assetMap().get(record.assetId);
    return asset ? `${asset.equipment_code} - ${asset.location}` : `Asset #${record.assetId}`;
  }

  protected timeLabel(record: ServiceRecord): string {
    const formatter = new Intl.DateTimeFormat('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const start = formatter.format(new Date(record.serviceDate));
    return record.endDate ? `${start}-${formatter.format(new Date(record.endDate))}` : start;
  }

  protected selectedDateLabel(): string {
    return new Intl.DateTimeFormat('th-TH', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(this.parseDateKey(this.selectedDate()));
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

  private dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseDateKey(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private loadAssets(): void {
    this.assetService.retrieveAssets().subscribe({
      next: (assets) => {
        this.assets.set(assets);
        this.openFormForEquipment(this.route.snapshot.queryParamMap.get('equipmentCode') ?? '');
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.error ?? 'ไม่สามารถโหลดข้อมูลเครื่องจักรได้');
      },
    });
  }

  private openFormForEquipment(equipmentCode: string): void {
    if (!equipmentCode || this.assets().length === 0) {
      return;
    }
    const asset = this.assets().find((item) => item.equipment_code === equipmentCode);
    if (asset) {
      this.eventForm.patchValue({ assetId: asset.id });
      this.isFormOpen.set(true);
    }
  }

  private loadRecords(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.serviceRecordService.get('OM').subscribe({
      next: (records) => {
        this.records.set([...records].sort((a, b) => a.serviceDate.localeCompare(b.serviceDate)));
        const nearestRecord = this.nearestRecord(records);
        if (nearestRecord) {
          const date = new Date(nearestRecord.serviceDate);
          this.visibleDate.set(date);
          this.selectedDate.set(this.dateKey(date));
        }
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.error ?? 'ไม่สามารถโหลดงาน OM ได้');
        this.isLoading.set(false);
      },
    });
  }

  private nearestRecord(records: ServiceRecord[]): ServiceRecord | undefined {
    const todayKey = this.dateKey(new Date());
    const sorted = [...records].sort((a, b) => a.serviceDate.localeCompare(b.serviceDate));
    return (
      sorted.find((record) => this.dateKey(new Date(record.serviceDate)) >= todayKey) ??
      sorted.at(-1)
    );
  }

  private toISOString(date: string, time: string): string {
    return new Date(`${date}T${time}:00`).toISOString();
  }

  private timeInputValue(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
}
