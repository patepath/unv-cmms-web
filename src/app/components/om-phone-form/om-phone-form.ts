import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Asset } from '../../interface';
import { AssetService } from '../../services/asset.service';
import { ServiceRecordService } from '../../services/service-record.service';

@Component({
  selector: 'app-om-phone-form',
  imports: [ReactiveFormsModule],
  templateUrl: './om-phone-form.html',
  styleUrl: './om-phone-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OmPhoneForm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly assetService = inject(AssetService);
  private readonly serviceRecordService = inject(ServiceRecordService);

  protected readonly asset = signal<Asset | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    date: [this.localDate(new Date()), Validators.required],
    startTime: ['08:00', Validators.required],
    endTime: ['09:00', Validators.required],
    details: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  constructor() {
    const equipmentCode =
      this.route.snapshot.queryParamMap.get('equipmentCode')?.trim() ??
      this.route.snapshot.paramMap.get('equipmentCode')?.trim() ??
      '';
    if (!equipmentCode) {
      this.isLoading.set(false);
      this.errorMessage.set('ไม่พบรหัสเครื่องจักร');
      return;
    }
    this.loadAsset(equipmentCode);
  }

  protected save(): void {
    const asset = this.asset();
    if (!asset || this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.endTime <= value.startTime) {
      this.errorMessage.set('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่มต้น');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.serviceRecordService
      .create({
        assetId: asset.id,
        recordType: 'OM',
        serviceDate: this.toISOString(value.date, value.startTime),
        endDate: this.toISOString(value.date, value.endTime),
        details: value.details.trim(),
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.successMessage.set('บันทึกงาน OM เรียบร้อยแล้ว');
          this.form.patchValue({ details: '' });
        },
        error: (error: HttpErrorResponse) => {
          this.isSaving.set(false);
          this.errorMessage.set(error.error?.error ?? 'ไม่สามารถบันทึกงาน OM ได้');
        },
      });
  }

  protected cancel(): void {
    const equipmentCode = this.asset()?.equipment_code;
    void this.router.navigate(equipmentCode ? ['/equipment', equipmentCode] : ['/equipment']);
  }

  protected buildingLabel(asset: Asset): string {
    return (
      asset.buildings.map((building) => `${building.code} - ${building.name}`).join(', ') || '-'
    );
  }

  private loadAsset(equipmentCode: string): void {
    this.assetService.getByEquipmentCode(equipmentCode).subscribe({
      next: (asset) => {
        this.asset.set(asset);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(
          error.status === 404
            ? `ไม่พบเครื่องจักร ${equipmentCode}`
            : (error.error?.error ?? 'ไม่สามารถโหลดข้อมูลเครื่องจักรได้'),
        );
        this.isLoading.set(false);
      },
    });
  }

  private localDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;
  }

  private toISOString(date: string, time: string): string {
    return new Date(`${date}T${time}:00`).toISOString();
  }
}
