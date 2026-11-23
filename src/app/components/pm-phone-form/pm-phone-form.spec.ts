import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmPhoneForm } from './pm-phone-form';

describe('PmPhoneForm', () => {
  let component: PmPhoneForm;
  let fixture: ComponentFixture<PmPhoneForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PmPhoneForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PmPhoneForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
