import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Asset } from '../../../interface';

@Component({
  selector: 'app-asset-detail',
  imports: [],
  templateUrl: './asset-detail.html',
  styleUrl: './asset-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetDetail {
  readonly asset = input.required<Asset>();
  readonly editRequested = output<Asset>();
  readonly deleteRequested = output<Asset>();
}
