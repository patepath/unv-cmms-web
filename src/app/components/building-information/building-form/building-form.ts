import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BuildingService } from '../../../services/building.service';

@Component({
  selector: 'app-building-form',
  imports: [ReactiveFormsModule],
  templateUrl: './building-form.html',
  styleUrl: './building-form.css',
})
export class BuildingForm implements OnInit {
  public isSaving = false;
  public errorMessage = '';
  private originalCode: string | null = null;
  public buildingForm = new FormGroup({
    code: new FormControl(''),
    name: new FormControl(''),
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private buildingService: BuildingService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code')?.trim();
    if (!code) {
      return;
    }

    this.originalCode = code;
    this.buildingService.getByCode(code).subscribe({
      next: (building) => {
        this.buildingForm.patchValue({
          code: building.code,
          name: building.name,
        });
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.error ?? 'ไม่สามารถโหลดข้อมูลอาคารได้';
        this.changeDetector.markForCheck();
      },
    });
  }

  save(): void {
    if (this.buildingForm.invalid || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    const value = this.buildingForm.getRawValue();
    const draft = {
      code: value.code?.trim() ?? '',
      name: value.name?.trim() ?? '',
    };
    const request =
      this.originalCode === null
        ? this.buildingService.create(draft)
        : this.buildingService.update(this.originalCode, draft);

    request.subscribe({
      next: () => this.cancel(),
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.errorMessage = error.error?.error ?? 'ไม่สามารถบันทึกข้อมูลอาคารได้';
        this.changeDetector.markForCheck();
      },
    });
  }

  cancel(): void {
    void this.router.navigate(['/admin/building-list']);
  }
}
