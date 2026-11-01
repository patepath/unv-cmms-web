import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Building, DataTable } from '../../interface';
import { RouterLink } from '@angular/router';
import { BuildingService } from '../../services/building.service';

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
	public buildings: Building[] = [];

	constructor(private buildingService: BuildingService) {
		this.dataTable = {
			headerRow: ['รหัสอาคาร','ชื่ออาคาร'],
			footerRow: ['รหัสอาคาร','ชื่ออาคาร'],
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

		let table = $('#setting-building-table').DataTable({
			dom: 'frtip',
			buttons: ['copy', 'csv', 'excel', 'print'],
			columnDefs: [
				{ target: [0], width: '8em', className: 'text-center' },
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

	search() {
		this.buildingService.get().subscribe(rs => {
			this.buildings = rs;

			this.data = this.buildings.map(b => [b.code, b.name]);

			this.dataTable.dataRows = this.data;
			// Refresh the table with new data
			$('#setting-building-table').DataTable().clear().rows.add(this.data).draw();
		});
	}
}
