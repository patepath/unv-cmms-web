import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Asset, AssetDraft } from '../interface';

@Injectable({ providedIn: 'root' })
export class AssetService {
  private readonly http = inject(HttpClient);
  private readonly assetUrl = `${environment.apiUrl}/asset/`;
  private readonly assetState = signal<Asset[]>([]);

  readonly assets = this.assetState.asReadonly();

  retrieveAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.assetUrl).pipe(
      tap((assets) => this.assetState.set(assets)),
    );
  }

  get(id: number): Observable<Asset> {
    return this.http.get<Asset>(`${this.assetUrl}${id}`);
  }

  create(draft: AssetDraft): Observable<Asset> {
    return this.http.post<Asset>(this.assetUrl, draft).pipe(
      tap((asset) => this.assetState.update((assets) => [asset, ...assets])),
    );
  }

  update(id: number, draft: AssetDraft): Observable<Asset> {
    return this.http.put<Asset>(`${this.assetUrl}${id}`, draft).pipe(
      tap((asset) =>
        this.assetState.update((assets) =>
          assets.map((current) => (current.id === id ? asset : current)),
        ),
      ),
    );
  }

  delete(id: number): void {
    this.assetState.update((assets) => assets.filter((asset) => asset.id !== id));
  }

}
