import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Asset, AssetCondition, AssetDraft, Condition } from '../../../interface';
import { CategoryService } from '../../../services/category.service';
import { LocationService } from '../../../services/location.service';
import { ConditionService } from '../../../services/condition.service';

@Component({
  selector: 'app-asset-form',
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './asset-form.html',
  styleUrl: './asset-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetForm {
  private readonly formBuilder = inject(FormBuilder);

  private readonly categoryService = inject(CategoryService);
  protected readonly categories = this.categoryService.get();

  private readonly locationService = inject(LocationService);
  protected readonly locations = this.locationService.get();

  readonly asset = input<Asset | null>(null);
  readonly saved = output<AssetDraft>();
  readonly cancelled = output<void>();
  protected readonly isEditing = computed(() => this.asset() !== null);

  private readonly conditionService = inject(ConditionService);
  protected readonly conditions = this.conditionService.get();

  protected readonly assetForm = this.formBuilder.nonNullable.group({
    id: ['', [Validators.required]],
    code: ['', [Validators.required]],
    tag: [''],
    category: ['', Validators.required],
    location: ['', Validators.required],
    area: [''],
    floor: [''],
    owner: [''],
    condition: ['', Validators.required],
    nextService: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}\/\d{4}$/)]],
  });

  constructor() {
    effect(() => {
      const asset = this.asset();
      if (asset) {
        this.assetForm.reset({
          id: asset.id,
          code: asset.code,
          tag: asset.tag,
          category: asset.category.id,
          location: asset.location.id,
          owner: asset.owner,
          condition: asset.condition.id,
          nextService: this.formatDateForDisplay(asset.next_service),
        });
      } else {
        this.assetForm.reset({
          id: '',
          code: '',
          tag: '',
          category: '',
          location: '',
          owner: '',
          condition: '',
          nextService: '',
        });
      }
    });
  }

  protected submit(): void {
    if (this.assetForm.invalid) {
      this.assetForm.markAllAsTouched();
      return;
    }

    //this.saved.emit(this.assetForm.getRawValue());
  }

  private formatDateForDisplay(date: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : date;
  }
}
