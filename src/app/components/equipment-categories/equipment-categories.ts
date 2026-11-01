import { ChangeDetectionStrategy, Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Category, DataTable } from '../../interface';
import { CategoryService } from '../../services/category.service';
import { RouterLink } from '@angular/router';

declare let $:any;

@Component({
  selector: 'app-equipment-categories',
  imports: [RouterLink],
  templateUrl: './equipment-categories.html',
  styleUrl: './equipment-categories.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquipmentCategories implements OnInit, AfterViewInit {

	public dataTable!: DataTable;
	public data!: string[][];

	constructor() {
		this.dataTable = {
			headerRow: ['ประเภทอุปกรณ์'],
			footerRow: ['ประเภทอุปกรณ์'],
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

		let table = $('#setting-category-table').DataTable({
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
}
