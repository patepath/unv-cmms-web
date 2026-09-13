import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Asset, AssetDraft } from '../../interface';
import { AssetService } from '../../services/asset.service';
import { AssetDetail } from './asset-detail/asset-detail';
import { AssetManagement } from './asset-management/asset-management';

@Component({
  selector: 'app-assets',
  imports: [AssetDetail, AssetManagement],
  templateUrl: './assets.html',
  styleUrl: './assets.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Assets {
  private readonly assetService = inject(AssetService);
  protected readonly searchTerm = signal('');
  protected readonly selectedLocation = signal('All locations');
  protected readonly selectedAsset = signal<Asset | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly pageSize = 6;
  protected readonly editingAsset = signal<Asset | null>(null);
  protected readonly isFormOpen = signal(false);
  protected readonly formError = signal('');
  protected readonly locations = ['All locations', 'Building A', 'Workshop', 'Warehouse'];
  protected readonly assets = this.assetService.assets;

  protected readonly filteredAssets = computed(() => {
    const searchTerm = this.searchTerm().trim().toLowerCase();
    const location = this.selectedLocation();
    return this.assets().filter((asset) => {
      const matchesSearch =
        !searchTerm ||
        `${asset.tag} ${asset.id} ${asset.category} ${asset.owner}`
          .toLowerCase()
          .includes(searchTerm);
      const matchesLocation = location === 'All locations' || asset.location.name === location;

      return matchesSearch && matchesLocation;
    });
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filteredAssets().length / this.pageSize)),
  );

  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, index) => index + 1),
  );

  protected readonly pagedAssets = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    return this.filteredAssets().slice(startIndex, startIndex + this.pageSize);
  });

  constructor() {
    this.assetService.retrieveAssets().subscribe({
      error: (error: unknown) => console.error('Unable to retrieve assets.', error),
    });
  }

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.currentPage.set(1);
  }

  protected selectLocation(location: string): void {
    this.selectedLocation.set(location);
    this.currentPage.set(1);
  }

  protected goToPage(page: number): void {
    this.currentPage.set(Math.min(Math.max(page, 1), this.totalPages()));
  }

  protected previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  protected selectAsset(asset: Asset): void {
    this.selectedAsset.set(asset);
  }

  protected openCreateForm(): void {
    this.formError.set('');
    this.editingAsset.set(null);
    this.isFormOpen.set(true);
  }

  protected openEditForm(asset: Asset): void {
    this.formError.set('');
    this.editingAsset.set(asset);
    this.isFormOpen.set(true);
  }

  protected closeForm(): void {
    this.formError.set('');
    this.isFormOpen.set(false);
    this.editingAsset.set(null);
  }

  protected saveAsset(draft: AssetDraft): void {
    const editingAsset = this.editingAsset();
    const duplicate = this.assets().some(
      (asset) => asset.id === draft.id && asset.id !== editingAsset?.id,
    );

    if (duplicate) {
      this.formError.set(`Asset ID ${draft.id} is already registered.`);

      return;
    }

    const savedAsset = editingAsset
      ? this.assetService.update(editingAsset.id, draft)
      : this.assetService.create(draft);
    if (savedAsset) {
      this.selectedAsset.set(savedAsset);
      this.closeForm();
    }
  }

  protected deleteAsset(asset: Asset): void {
    if (!window.confirm(`Delete ${asset.tag} (${asset.id})?`)) {
      return;
    }

    this.assetService.delete(asset.id);
    this.selectedAsset.set(null);
  }
}
