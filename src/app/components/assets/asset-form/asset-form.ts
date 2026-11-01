import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup,  ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asset-form',
  imports: [ReactiveFormsModule],
  templateUrl: './asset-form.html',
  styleUrl: './asset-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetForm {

  public assetForm = new FormGroup({
    id: new FormControl(0),
    category_id: new FormControl(0),
    code: new FormControl(''),
    building_id: new FormControl(0),
    location: new FormControl(''),
    floor: new FormControl(''),
    no: new FormControl(''),
    tag: new FormControl(''),
    brand_id: new FormControl(0),
  });

  constructor(private router: Router) {
    
  }

  public save(): void {
  }

  public cancel(): void {
    this.router.navigate(['/admin/assets-list']);
  }
}
