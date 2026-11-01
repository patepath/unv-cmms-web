import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataTable } from '../../interface';
import { ReactiveFormsModule } from '@angular/forms';

declare let $:any;

@Component({
  selector: 'app-assets',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './assets.html',
  styleUrl: './assets.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Assets implements OnInit, AfterViewInit {
	public dataTable!: DataTable;
	public data!: string[][];

	constructor() {
		this.dataTable = {
			headerRow: ['Equipment ID', 'Building No.', 'Building Name', 'Location', 'Floor', 'Asset No.', 'Asset Tag', 'Brand' ],
			footerRow: ['Equipment ID', 'Building No.', 'Building Name', 'Location', 'Floor', 'Asset No.', 'Asset Tag', 'Brand' ],
			dataRows: [],
		};

		this.data = [];
	}

	public ngOnInit(): void {
		// Initialization logic here
	}

	public ngAfterViewInit(): void {
		this.initTable();
	}

 	initTable() {
		let self = this;

		let table = $('#setting-user-table').DataTable({
			dom: 'Bfrtip',
			buttons: ['copy', 'csv', 'excel', 'print'],
			columnDefs: [
				{ target: [0], width: '18em', className: 'dt-left' },
				{ target: [2, 3 ], width: '18em', className: 'dt-center' },
			],
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
}
