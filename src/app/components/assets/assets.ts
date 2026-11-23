import {
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Asset, DataTable } from '../../interface';
import { ReactiveFormsModule } from '@angular/forms';
import { AssetService } from '../../services/asset.service';
import { Subscription } from 'rxjs';

declare let $: any;

@Component({
  selector: 'app-assets',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './assets.html',
  styleUrl: './assets.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Assets implements OnInit, AfterViewInit, OnDestroy {
  public dataTable!: DataTable;
  public data!: string[][];
  public errorMessage = '';
  public selectedCategoryId = 0;
  private assets: Asset[] = [];
  private displayedAssets: Asset[] = [];
  private tableInitialized = false;
  private assetRequest?: Subscription;

  constructor(
    private assetService: AssetService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.dataTable = {
      headerRow: [
        'Equipment ID.',
        'Building No.',
        'Building Name',
        'สถานที่ติดตั้ง',
        'ชั้น',
        'หมายเลขครุภัณฑ์',
        'Asset Tag',
        'ยี่ห้อ',
      ],
      footerRow: [
        'Equipment ID.',
        'Building No.',
        'Building Name',
        'สถานที่ติดตั้ง',
        'ชั้น',
        'หมายเลขครุภัณฑ์',
        'Asset Tag',
        'ยี่ห้อ',
      ],
      dataRows: [],
    };

    this.data = [];
  }

  public ngOnInit(): void {
    this.loadAssets();
  }

  public ngOnDestroy(): void {
    this.assetRequest?.unsubscribe();
  }

  private loadAssets(): void {
    this.assetRequest?.unsubscribe();
    const request =
      this.selectedCategoryId === 0
        ? this.assetService.retrieveAssets()
        : this.assetService.retrieveAssetsByCategory(this.selectedCategoryId);

    this.assetRequest = request.subscribe({
      next: (assets) => {
        this.setAssetRows(assets);
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.error ?? 'ไม่สามารถโหลดข้อมูล asset ได้';
        this.changeDetector.markForCheck();
      },
    });
  }

  public ngAfterViewInit(): void {
    this.initTable();
    this.tableInitialized = true;
    this.refreshTable();
  }

  initTable() {
    const table = $('#setting-user-table').DataTable({
      dom: 'Bfrtip',
      buttons: ['copy', 'csv', 'excel', 'print'],
      columnDefs: [
        { target: [0], width: '8em', className: 'dt-center' },
        { target: [3], width: '25em' },
      ],
      responsive: true,
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
      },
      ordering: false,
      paging: true,
      pageLength: 10,
      pagingType: 'full_numbers',
    });

    table.on('mouseover', 'tr', function (this: any) {
      $(this).css('cursor', 'pointer');
      $(this).css('font-weight', 'bold');
    });

    table.on('mouseout', 'tr', function (this: any) {
      $(this).css('font-weight', 'normal');
    });

    table.on('click', 'tbody tr', (event: Event) => {
      const rowIndex = table.row(event.currentTarget).index();
      const asset = this.displayedAssets[rowIndex];
      if (asset) {
        this.router.navigate(['/admin/asset-form'], {
          queryParams: { id: asset.id },
        });
      }
    });
  }

  private setAssetRows(assets: Asset[]): void {
    this.assets = assets;
    this.applyCategoryFilter();
  }

  public search(event: Event): void {
    const categoryId = Number((event.target as HTMLSelectElement).value);
    this.selectedCategoryId = Number.isNaN(categoryId) ? 0 : categoryId;
    this.errorMessage = '';
    this.loadAssets();
  }

  private applyCategoryFilter(): void {
    this.displayedAssets = this.assets;

    this.data = this.displayedAssets.map((asset) => {
      const buildings = asset.buildings ?? [];
      return [
        String(asset.equipment_code),
        buildings.map((building) => building.code).join(', ') || '-',
        buildings.map((building) => building.name).join(', ') || '-',
        asset.location,
        asset.floor,
        asset.asset_no,
        asset.asset_tag,
        asset.brand?.name ?? '-',
      ];
    });
    this.dataTable.dataRows = this.data;
    this.refreshTable();
  }

  private refreshTable(): void {
    if (!this.tableInitialized) {
      return;
    }

    $('#setting-user-table').DataTable().clear().rows.add(this.data).draw();
  }
}
