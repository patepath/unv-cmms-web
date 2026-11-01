import { Component } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-form',
  imports: [ReactiveFormsModule],
  templateUrl: './category-form.html',
  styleUrl: './category-form.css',
})
export class CategoryForm {
  public categoryForm = new FormGroup({
    id: new FormControl(0),
    name: new FormControl('')
  });

  constructor(private router: Router) {

  }

  save() {
    
  }

  cancel() {
    this.router.navigate(['/admin/category-list']);
  }
}
