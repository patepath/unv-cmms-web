import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-brand-form',
  imports: [ReactiveFormsModule],
  templateUrl: './brand-form.html',
  styleUrl: './brand-form.css',
})
export class BrandForm {

  public brandForm = new FormGroup({
    id: new FormControl(0),
    name: new FormControl('')
  });

  constructor(private router: Router) {

  }

  save() {
    
  }

  cancel() {
    this.router.navigate(['/admin/brand-list']);
  }
}
