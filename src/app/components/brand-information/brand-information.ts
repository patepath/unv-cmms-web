import {
  AfterViewInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { Brand, Category, DataTable } from '../../interface';
import { BrandService } from '../../services/brand.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService } from '../../services/category.service';
import { HttpErrorResponse } from '@angular/common/http';

declare let $: any;

@Component({
  selector: 'app-brand-information',
  imports: [RouterLink],
  templateUrl: './brand-information.html',
  styleUrl: './brand-information.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandInformation implements OnInit, AfterViewInit {
  public dataTable!: DataTable;
  public data!: string[][];
  public categories: Category[] = [];
  public selectedCategoryId = 0;
  public errorMessage = '';
  private tableInitialized = false;
  private displayedBrands: Brand[] = [];

  constructor(
    private brandService: BrandService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.dataTable = {
      headerRow: ['หมวดหมู่', 'ชื่อยี่ห้อ'],
      footerRow: ['หมวดหมู่', 'ชื่อยี่ห้อ'],
      dataRows: [],
    };

    this.data = [];
  }

  ngOnInit(): void {
    const selectedCategoryId = Number(this.route.snapshot.queryParamMap.get('selectedCategoryId'));
    this.selectedCategoryId =
      Number.isInteger(selectedCategoryId) && selectedCategoryId > 0 ? selectedCategoryId : 0;

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
    this.loadBrands();
  }

  ngAfterViewInit(): void {
    this.initTable();
    this.tableInitialized = true;
    this.refreshTable();
  }

  initTable() {
    let self = this;

    let table = $('#setting-brand-table').DataTable({
      dom: 'Bfrtip',
      buttons: ['copy', 'csv', 'excel', 'print'],
      columnDefs: [{ target: [0], width: '15em' }],
      responsive: true,
      language: {
        search: '_INPUT_',
        searchPlaceholder: 'Search records',
      },
      ordering: false,
      paging: true,
      pageLength: 15,
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
      const brand = this.displayedBrands[rowIndex];
      if (brand) {
        void this.router.navigate(['/admin/brand-form'], {
          queryParams: {
            id: brand.id,
            selectedCategoryId: this.selectedCategoryId || null,
          },
        });
      }
    });

    //self.search();
  }

  search() {
    this.loadBrands();
  }

  selectCategory(event: Event): void {
    const categoryId = Number((event.target as HTMLSelectElement).value);
    this.selectedCategoryId = Number.isInteger(categoryId) && categoryId > 0 ? categoryId : 0;
    this.errorMessage = '';
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { selectedCategoryId: this.selectedCategoryId || null },
      replaceUrl: true,
    });
    this.loadBrands();
  }

  private loadBrands(): void {
    const request =
      this.selectedCategoryId === 0
        ? this.brandService.get()
        : this.brandService.getByCategory(this.selectedCategoryId);

    request.subscribe({
      next: (brands) => {
        this.displayedBrands = [...brands].sort((a, b) => {
          const categoryCompare = (a.category?.name ?? '').localeCompare(
            b.category?.name ?? '',
            'th',
          );
          return categoryCompare || a.name.localeCompare(b.name, 'th');
        });
        this.data = this.displayedBrands.map((brand) => [brand.category?.name ?? '-', brand.name]);

        this.dataTable.dataRows = this.data;
        this.refreshTable();
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.error ?? 'ไม่สามารถโหลดข้อมูลยี่ห้อได้';
        this.changeDetector.markForCheck();
      },
    });
  }

  private refreshTable(): void {
    if (this.tableInitialized) {
      $('#setting-brand-table').DataTable().clear().rows.add(this.data).draw();
    }
  }
}
