import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Category } from '../../../interface';
import { BrandService } from '../../../services/brand.service';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-brand-form',
  imports: [ReactiveFormsModule],
  templateUrl: './brand-form.html',
  styleUrl: './brand-form.css',
})
export class BrandForm implements OnInit {
  public categories: Category[] = [];
  public isSaving = false;
  public errorMessage = '';
  private brandId: number | null = null;
  private selectedCategoryId = 0;
  public brandForm = new FormGroup({
    category_id: new FormControl(0),
    name: new FormControl(''),
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private brandService: BrandService,
    private categoryService: CategoryService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const selectedCategoryId = Number(this.route.snapshot.queryParamMap.get('selectedCategoryId'));
    this.selectedCategoryId =
      Number.isInteger(selectedCategoryId) && selectedCategoryId > 0 ? selectedCategoryId : 0;
    this.brandForm.patchValue({ category_id: this.selectedCategoryId });

    this.categoryService.get().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.error ?? 'ไม่สามารถโหลดข้อมูลหมวดหมู่ได้';
        this.changeDetector.markForCheck();
      },
    });

    const brandId = Number(this.route.snapshot.queryParamMap.get('id'));
    if (Number.isInteger(brandId) && brandId > 0) {
      this.brandId = brandId;
      this.brandService.getById(brandId).subscribe({
        next: (brand) => {
          this.brandForm.patchValue({
            category_id: brand.category_id ?? 0,
            name: brand.name,
          });
          this.changeDetector.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = error.error?.error ?? 'ไม่สามารถโหลดข้อมูลยี่ห้อได้';
          this.changeDetector.markForCheck();
        },
      });
    }
  }

  save(): void {
    if (this.brandForm.invalid || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    const value = this.brandForm.getRawValue();
    const draft = {
      category_id: value.category_id || null,
      name: value.name?.trim() ?? '',
    };
    const request =
      this.brandId === null
        ? this.brandService.create(draft)
        : this.brandService.update(this.brandId, draft);

    request.subscribe({
      next: () => this.cancel(),
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.errorMessage = error.error?.error ?? 'ไม่สามารถบันทึกข้อมูลยี่ห้อได้';
        this.changeDetector.markForCheck();
      },
    });
  }

  cancel(): void {
    void this.router.navigate(['/admin/brand-list'], {
      queryParams: { selectedCategoryId: this.selectedCategoryId || null },
    });
  }
}
