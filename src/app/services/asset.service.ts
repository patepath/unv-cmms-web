import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Asset, AssetDraft } from '../interface';

@Injectable({ providedIn: 'root' })
export class AssetService {
  private readonly http = inject(HttpClient);
  private readonly assetUrl = 'http://localhost:3000/api/v1/asset/';
  private readonly assetState = signal<Asset[]>([
    {
      id: 'AST-204',
      tag: 'Cooling system unit 01',
      category: { id: '1', name: 'HVAC' },
      location: { id: '1', name: 'Building A' },
      owner: 'Facilities team',
      condition: { id: '1', name: 'ใช้งานได้ปกติ' },
      last_service: '12 Aug 2026',
      next_service: '18 Sep 2026',
      service_records: [
        { date: '12 Aug 2026', task: 'Filter inspection and replacement', technician: 'Narin K.' },
        { date: '10 May 2026', task: 'Refrigerant pressure check', technician: 'Mali P.' },
      ],
      code: '',
      model: '',
      brand_name: '',
      purchase_date: '',
      warranty_end: '',
      created_at: '',
      updated_at: '',
      area: '',
      floor: ''
    },
    {
      id: 'AST-203',
      tag: 'Hydraulic press 02',
      category: { id: '2', name: 'Production equipment' },
      location: { id: '2', name: 'Workshop' },
      owner: 'Production team',
      condition: { id: '2', name: 'ไม่ได้ใช้งาน' },
      last_service: '28 Jul 2026',
      next_service: '28 Aug 2026',
      service_records: [
        { date: '28 Jul 2026', task: 'Hydraulic oil level check', technician: 'Somchai T.' },
        { date: '28 Apr 2026', task: 'Safety guard inspection', technician: 'Narin K.' },
      ],
      code: '',
      model: '',
      brand_name: '',
      purchase_date: '',
      warranty_end: '',
      created_at: '',
      updated_at: '',
      area: '',
      floor: ''
    },
    {
      id: 'AST-202',
      tag: 'Loading dock sensor 02',
      category: { id: '3', name: 'Safety system' },
      location: { id: '4', name: 'Warehouse' },
      owner: 'Logistics team',
      condition: { id: '1', name: 'ใช้งานได้ปกติ' },
      last_service: '02 Sep 2026',
      next_service: '02 Dec 2026',
      service_records: [
        { date: '02 Sep 2026', task: 'Sensor alignment and test', technician: 'Mali P.' },
      ],
      code: '',
      model: '',
      brand_name: '',
      purchase_date: '',
      warranty_end: '',
      created_at: '',
      updated_at: '',
      area: '',
      floor: ''
    },
  ]);

  readonly assets = this.assetState.asReadonly();

  retrieveAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.assetUrl).pipe(tap((assets) => this.assetState.set(assets)));
  }

  create(draft: AssetDraft): Asset {
    const asset: Asset = {
      ...draft,
      last_service: 'Not serviced',
      service_records: [],
    };
    this.assetState.update((assets) => [asset, ...assets]);

    return asset;
  }

  update(id: string, draft: AssetDraft): Asset | undefined {
    let updatedAsset: Asset | undefined;
    this.assetState.update((assets) =>
      assets.map((asset) => {
        if (asset.id !== id) {
          return asset;
        }
        updatedAsset = { ...asset, ...draft };

        return updatedAsset;
      }),
    );

    return updatedAsset;
  }

  delete(id: string): void {
    this.assetState.update((assets) => assets.filter((asset) => asset.id !== id));
  }
}
