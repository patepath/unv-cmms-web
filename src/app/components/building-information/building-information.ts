import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DataTable } from '../../interface';
import { RouterLink } from '@angular/router';

declare let $:any;

@Component({
  selector: 'app-building-information',
  imports: [RouterLink],
  templateUrl: './building-information.html',
  styleUrl: './building-information.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuildingInformation implements OnInit, AfterViewInit {
	public dataTable!: DataTable;
	public data!: string[][];

	constructor() {
		this.dataTable = {
			headerRow: ['รหัสอาคาร','ชื่ออาคาร'],
			footerRow: ['รหัสอาคาร','ชื่ออาคาร'],
			dataRows: [],
		};

		this.data = [];
	}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
		this.initTable();
  }

 	initTable() {
		let self = this;

		let table = $('#setting-building-table').DataTable({
			dom: 'frtip',
			buttons: ['copy', 'csv', 'excel', 'print'],
			columnDefs: [
				{ target: [0], width: '18em', className: 'text-center' },
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
