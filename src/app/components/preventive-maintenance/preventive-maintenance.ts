import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Asset } from '../../interface';
import { AssetService } from '../../services/asset.service';
import { ServiceRecord, ServiceRecordService } from '../../services/service-record.service';
import { map } from 'rxjs';

type CalendarView = 'week' | 'month';
type CalendarDay = {
  date: Date;
  key: string;
  number: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

@Component({
  selector: 'app-preventive-maintenance',
  imports: [ReactiveFormsModule],
  templateUrl: './preventive-maintenance.html',
  styleUrl: './preventive-maintenance.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreventiveMaintenance {
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

  protected readonly planForm = this.formBuilder.nonNullable.group({
    assetId: [0, Validators.min(1)],
    date: [this.dateKey(new Date()), Validators.required],
    time: ['09:00', Validators.required],
    repeatInterval: ['none'],
    repeatCount: [1, [Validators.required, Validators.min(1), Validators.max(366)]],
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
    this.planForm.patchValue({ date: day.key });
    this.isFormOpen.set(true);
  }

  protected openForm(): void {
    this.planForm.patchValue({ date: this.selectedDate(), time: '09:00' });
    this.isFormOpen.set(true);
  }

  protected closeForm(): void {
    this.isFormOpen.set(false);
  }

  protected savePlan(): void {
    if (this.planForm.invalid || this.isSaving()) {
      this.planForm.markAllAsTouched();
      return;
    }
    const value = this.planForm.getRawValue();
    this.isSaving.set(true);
    this.errorMessage.set('');
    const draft = {
      assetId: value.assetId,
      recordType: 'PM' as const,
      serviceDate: `${value.date}T${value.time}:00`,
      details: value.details.trim(),
    };
    const request =
      value.repeatInterval === 'none'
        ? this.serviceRecordService.create(draft).pipe(map((record) => [record]))
        : this.serviceRecordService.createRepeated({
            ...draft,
            repeatInterval: value.repeatInterval,
            repeatCount: value.repeatCount,
          });

    request.subscribe({
      next: (createdRecords) => {
        this.records.update((records) => [...records, ...createdRecords]);
        this.selectedDate.set(value.date);
        this.isSaving.set(false);
        this.isFormOpen.set(false);
        this.planForm.patchValue({ details: '' });
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.error ?? 'ไม่สามารถบันทึกงาน PM ได้');
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
    return new Intl.DateTimeFormat('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(record.serviceDate));
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
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private parseDateKey(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private loadAssets(): void {
    this.assetService.retrieveAssets().subscribe({
      next: (assets) => {
        this.assets.set(assets);
        const equipmentCode = this.route.snapshot.queryParamMap.get('equipmentCode');
        const asset = assets.find((item) => item.equipment_code === equipmentCode);
        if (asset) {
          this.planForm.patchValue({ assetId: asset.id });
          this.isFormOpen.set(true);
        }
      },
      error: (error: HttpErrorResponse) =>
        this.errorMessage.set(error.error?.error ?? 'ไม่สามารถโหลดข้อมูลเครื่องจักรได้'),
    });
  }

  private loadRecords(): void {
    this.serviceRecordService.get('PM').subscribe({
      next: (records) => {
        this.records.set(records);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.error ?? 'ไม่สามารถโหลดงาน PM ได้');
        this.isLoading.set(false);
      },
    });
  }
}
