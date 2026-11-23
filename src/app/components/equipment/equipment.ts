import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Asset } from '../../interface';
import { AssetService } from '../../services/asset.service';

@Component({
  selector: 'app-equipment',
  imports: [RouterLink],
  templateUrl: './equipment.html',
  styleUrl: './equipment.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Equipment {
  private readonly assetService = inject(AssetService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly asset = signal<Asset | null>(null);
  protected readonly equipmentCode = signal('');
  protected readonly hasRouteCode = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const equipmentCode = params.get('equipmentCode')?.trim() ?? '';
      this.equipmentCode.set(equipmentCode);
      this.hasRouteCode.set(Boolean(equipmentCode));
      if (equipmentCode) {
        this.loadAsset(equipmentCode);
      } else {
        this.asset.set(null);
        this.errorMessage.set('');
      }
    });
  }

  protected updateEquipmentCode(event: Event): void {
    this.equipmentCode.set((event.target as HTMLInputElement).value);
  }

  protected submitSearch(event: Event): void {
    event.preventDefault();
    const equipmentCode = this.equipmentCode().trim();
    if (!equipmentCode) {
      this.asset.set(null);
      this.errorMessage.set('กรุณากรอกรหัสเครื่องจักร');
      return;
    }

    this.hasRouteCode.set(true);
    void this.router.navigate(['/equipment', equipmentCode], { replaceUrl: true });
  }

  protected reload(): void {
    const equipmentCode = this.equipmentCode().trim();
    if (equipmentCode) {
      this.loadAsset(equipmentCode);
    }
  }

  protected buildingCodes(asset: Asset): string {
    return asset.buildings.map((building) => building.code).join(', ') || '-';
  }

  protected buildingNames(asset: Asset): string {
    return asset.buildings.map((building) => building.name).join(', ') || '-';
  }

  private loadAsset(equipmentCode: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.asset.set(null);
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
}
