import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Brand, DataTable } from '../../interface';
import { BrandService } from '../../services/brand.service';
import { RouterLink } from '@angular/router';

declare let $:any;

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

	constructor(private brandService: BrandService) {
		this.dataTable = {
			headerRow: ['ชื่อยี่ห้อ'],
			footerRow: ['ชื่อยี่ห้อ'],
			dataRows: [],
		};

		this.data = [];
	}

	ngOnInit(): void {
		this.search();
	}

	ngAfterViewInit(): void {
		this.initTable();
	}

 	initTable() {
		let self = this;

		let table = $('#setting-brand-table').DataTable({
			dom: 'frtip',
			buttons: ['copy', 'csv', 'excel', 'print'],
			columnDefs: [],
			responsive: true,
			language: {
				search: "_INPUT_",
				searchPlaceholder: "Search records",
			},
			ordering: false,
			paging: true,
			pageLength: 15,
			pagingType: "full_numbers",
		});

		table.on('mouseover', 'tr', function(this: any) {
			$(this).css('cursor', 'pointer');
			$(this).css('font-weight', 'bold');
		});

		table.on('mouseout', 'tr', function(this: any) {
			$(this).css('font-weight', 'normal');
		});

		table.on('click', 'td', function(this: any) {
			//self.edit(table.row(this).index());
		});

		//self.search();
	} 

	search() {
		this.brandService.get().subscribe(rs => {
			this.data = rs.map(b => [b.name]);

			this.dataTable.dataRows = this.data;
			// Refresh the table with new data
			$('#setting-brand-table').DataTable().clear().rows.add(this.data).draw();
		});
	}
}
