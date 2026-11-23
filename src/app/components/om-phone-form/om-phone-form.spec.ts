import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OmPhoneForm } from './om-phone-form';

describe('OmPhoneForm', () => {
  let component: OmPhoneForm;
  let fixture: ComponentFixture<OmPhoneForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OmPhoneForm],
    }).compileComponents();

    fixture = TestBed.createComponent(OmPhoneForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
