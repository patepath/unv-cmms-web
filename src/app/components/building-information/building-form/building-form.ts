import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Building } from '../../../interface';

@Component({
  selector: 'app-building-form',
  imports: [ReactiveFormsModule],
  templateUrl: './building-form.html',
  styleUrl: './building-form.css',
})
export class BuildingForm {

  public buildingForm = new FormGroup({
    code: new FormControl(''),
    name: new FormControl('')
  });

  public building: Building = <Building>{};

  constructor(private router: Router) {}

  save() {
    
  }

  cancel() {
    this.router.navigate(['/admin/building-list']);
  }
}
