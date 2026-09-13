import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Asset, AssetDraft } from '../../../interface';
import { AssetForm } from '../asset-form/asset-form';

@Component({
  selector: 'app-asset-management',
  imports: [AssetForm],
  templateUrl: './asset-management.html',
  styleUrl: './asset-management.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetManagement {
  readonly asset = input<Asset | null>(null);
  readonly error = input('');
  readonly saved = output<AssetDraft>();
  readonly cancelled = output<void>();
}
