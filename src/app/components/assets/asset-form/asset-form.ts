import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Asset, AssetDraft, Brand, Building, Category } from '../../../interface';
import { AssetService } from '../../../services/asset.service';
import { BuildingService } from '../../../services/building.service';
import { BrandService } from '../../../services/brand.service';
import { CategoryService } from '../../../services/category.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-asset-form',
  imports: [ReactiveFormsModule],
  templateUrl: './asset-form.html',
  styleUrl: './asset-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetForm implements OnInit, OnDestroy {
  public buildings: Building[] = [];
  public brands: Brand[] = [];
  public categories: Category[] = [];
  public selectedBuildingId = 0;
  public isSaving = false;
  public errorMessage = '';
  private assetId: number | null = null;
  private selectedCategoryId = 0;
  private categorySubscription?: Subscription;
  private brandSubscription?: Subscription;

  public assetForm = new FormGroup({
    id: new FormControl(0),
    category_id: new FormControl(0),
    equipment_code: new FormControl(''),
    building_ids: new FormControl<number[]>([]),
    location: new FormControl(''),
    floor: new FormControl(''),
    no: new FormControl(''),
    tag: new FormControl(''),
    brand_id: new FormControl(0),

    // หม้อแปลง
    tr_type: new FormControl(0),
    rate_capacity: new FormControl(''),
    protection_equipment: new FormControl(0),

    // ตู้เมน
    main_type: new FormControl(0),
    rate_current: new FormControl(''),
    unit_current: new FormControl(''),

    // เครื่องกำเนิดไฟฟ้า
    engine_model: new FormControl(''),
    engine_power_hp: new FormControl(0),
    engine_power_kw: new FormControl(0),
    alternative_brand: new FormControl(0),
    alternative_model: new FormControl(''),
    base_rating_kva: new FormControl(0),
    base_rating_kva_unit: new FormControl(''),
    base_rating_kw: new FormControl(0),
    fuel_tank_capacity: new FormControl(0),

    // ปั้มส่งน้ำ
    unit_number: new FormControl(0),
    motor_model: new FormControl(''),
    motor_power_hp: new FormControl(0),
    pump_brand: new FormControl(0),
    pump_model: new FormControl(''),
    flow_rate_min: new FormControl(),
    flow_rate_max: new FormControl(),

    // ปั้มเพิ่มแรงดัน
    pressure_tank_capacity: new FormControl(0),

    // ปั้มดับเพลิง
    diesel_engine_model: new FormControl(''),
    diesel_engine_power_hp: new FormControl(0),
    fire_pump_brand: new FormControl(0),
    fire_pump_model: new FormControl(''),
    fire_pump_flow_rate: new FormControl(0),

    // ปั้มเติมอากาศ
    blower_brand: new FormControl(0),
    blower_model: new FormControl(''),
    blower_airflow_capacity: new FormControl(0),
    blower_airflow_capacity_unit: new FormControl(''),

    // ปั้มจุ่ม
    flow_rate: new FormControl(),

    // กังหันตีน้ำ
    rpm: new FormControl(0),
    voltage: new FormControl(0),
    phase: new FormControl(0),

    // สปริงเกอร์

    // เครื่องสูบน้ำระบบเครื่องยนต์
    water_pump_model: new FormControl(''),
    battery: new FormControl(''),

    // เครื่องสูบน้ำระบบไฟฟ้า

    // แจ้งเหตุเพลิงไหม้
    fcp_model: new FormControl(''),
    cabinet_total: new FormControl(0),
    annuciator_brand: new FormControl(0),

    // ดับเพลิงชะลอ
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private assetService: AssetService,
    private buildingService: BuildingService,
    private brandService: BrandService,
    private categoryService: CategoryService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const selectedCategoryId = Number(this.route.snapshot.queryParamMap.get('selectedCategoryId'));
    this.selectedCategoryId =
      Number.isInteger(selectedCategoryId) && selectedCategoryId > 0 ? selectedCategoryId : 0;

    this.buildingService.get().subscribe({
      next: (buildings) => {
        this.buildings = buildings;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.error ?? 'ไม่สามารถโหลดข้อมูลอาคารได้';
        this.changeDetector.markForCheck();
      },
    });

    this.categoryService.get().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.error ?? 'ไม่สามารถโหลดข้อมูลประเภทอุปกรณ์ได้';
        this.changeDetector.markForCheck();
      },
    });

    this.categorySubscription = this.assetForm.controls.category_id.valueChanges.subscribe(
      (categoryId) => this.loadBrands(Number(categoryId)),
    );
    this.assetForm.patchValue({ category_id: this.selectedCategoryId });

    this.route.queryParamMap.subscribe((params) => {
      const id = Number(params.get('id'));

      if (id > 0) {
        this.assetId = id;
        this.assetService.get(id).subscribe({
          next: (asset) => this.populateForm(asset),
          error: (error: HttpErrorResponse) => {
            this.errorMessage = error.error?.error ?? 'ไม่สามารถโหลดข้อมูล asset ได้';
          },
        });
      }
    });
  }

  public ngOnDestroy(): void {
    this.categorySubscription?.unsubscribe();
    this.brandSubscription?.unsubscribe();
  }

  public save(): void {
    if (this.assetForm.invalid || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    const value = this.assetForm.getRawValue();
    const draft: AssetDraft = {
      category_id: value.category_id || null,
      equipment_code: value.equipment_code ?? '',
      location: value.location ?? '',
      floor: value.floor ?? '',
      asset_no: value.no ?? '',
      asset_tag: value.tag ?? '',
      building_ids: value.building_ids ?? [],
      brand_id: value.brand_id || null,
      model: value.engine_model ?? '',
      unit_number: String(value.unit_number ?? ''),
      status: 'ACTIVE',
    };

    const request =
      this.assetId === null
        ? this.assetService.create(draft)
        : this.assetService.update(this.assetId, draft);

    request.subscribe({
      next: () => this.returnToAssetList(),
      error: (error: HttpErrorResponse) => {
        this.isSaving = false;
        this.errorMessage = error.error?.error ?? 'ไม่สามารถบันทึกข้อมูล asset ได้';
      },
    });
  }

  private populateForm(asset: Asset): void {
    this.assetForm.patchValue({
      id: asset.id,
      equipment_code: asset.equipment_code,
      building_ids: asset.buildings.map((building) => building.id),
      location: asset.location,
      floor: asset.floor,
      no: asset.asset_no,
      tag: asset.asset_tag,
      engine_model: asset.model,
      unit_number: Number(asset.unit_number) || 0,
    });

    this.assetForm.controls.category_id.setValue(asset.category_id ?? 0, { emitEvent: false });
    this.loadBrands(asset.category_id ?? 0, asset.brand_id ?? 0);
  }

  public get selectedBuildings(): Building[] {
    const selectedIds = new Set(this.assetForm.controls.building_ids.value ?? []);

    return this.buildings
      .filter((building) => selectedIds.has(building.id))
      .sort((a, b) => a.code.localeCompare(b.code, 'th'));
  }

  public get availableBuildings(): Building[] {
    const selectedIds = new Set(this.assetForm.controls.building_ids.value ?? []);
    return this.buildings
      .filter((building) => !selectedIds.has(building.id))
      .sort((a, b) => a.code.localeCompare(b.code, 'th'));
  }

  public selectBuilding(event: Event): void {
    this.selectedBuildingId = Number((event.target as HTMLSelectElement).value);
  }

  public addBuilding(): void {
    if (!this.availableBuildings.some((building) => building.id === this.selectedBuildingId)) {
      return;
    }

    const buildingIds = this.assetForm.controls.building_ids.value ?? [];
    this.assetForm.controls.building_ids.setValue([...buildingIds, this.selectedBuildingId]);
    this.selectedBuildingId = 0;
  }

  public removeBuilding(buildingId: number): void {
    const buildingIds = this.assetForm.controls.building_ids.value ?? [];
    this.assetForm.controls.building_ids.setValue(buildingIds.filter((id) => id !== buildingId));
  }

  private loadBrands(categoryId: number, preferredBrandId = 0): void {
    this.brandSubscription?.unsubscribe();
    this.assetForm.controls.brand_id.setValue(preferredBrandId, { emitEvent: false });
    this.brands = [];

    this.selectedCategoryId = Number.isInteger(categoryId) && categoryId > 0 ? categoryId : 0;
    if (this.selectedCategoryId === 0) {
      this.changeDetector.markForCheck();
      return;
    }

    this.brandSubscription = this.brandService.getByCategory(this.selectedCategoryId).subscribe({
      next: (brands) => {
        this.brands = [...brands].sort((a, b) => a.name.localeCompare(b.name, 'th'));
        if (!this.brands.some((brand) => brand.id === preferredBrandId)) {
          this.assetForm.controls.brand_id.setValue(0, { emitEvent: false });
        }
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.error ?? 'ไม่สามารถโหลดข้อมูลยี่ห้อได้';
        this.changeDetector.markForCheck();
      },
    });
  }

  public cancel(): void {
    this.returnToAssetList();
  }

  private returnToAssetList(): void {
    void this.router.navigate(['/admin/assets-list'], {
      queryParams: { selectedCategoryId: this.selectedCategoryId || null },
    });
  }
}
