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

    // หม้อแปลง
    tr_type: new FormControl(0),
    rate_capacity: new FormControl(''),
    protection_equipment: new FormControl(0),

    // ตู้เมน
    main_type: new FormControl(0),
    rate_current: new FormControl(''),
    unit_current: new FormControl(''),

    // เครื่องกำเนิดไฟฟ้า
    engine_model: new FormControl(''),
    engine_power_hp: new FormControl(0),
    engine_power_kw: new FormControl(0),
    alternative_brand: new FormControl(0),
    alternative_model: new FormControl(''),
    base_rating_kva: new FormControl(0),
    base_rating_kva_unit: new FormControl(''),
    base_rating_kw: new FormControl(0),
    fuel_tank_capacity: new FormControl(0),

    // ปั้มส่งน้ำ
    unit_number: new FormControl(0),
    motor_model: new FormControl(''),
    motor_power_hp: new FormControl(0),
    pump_brand: new FormControl(0),
    pump_model: new FormControl(''),
    flow_rate_min: new FormControl(),
    flow_rate_max: new FormControl(),

    // ปั้มเพิ่มแรงดัน
    pressure_tank_capacity: new FormControl(0),

    // ปั้มดับเพลิง
    diesel_engine_model: new FormControl(''),
    diesel_engine_power_hp: new FormControl(0),
    fire_pump_brand: new FormControl(0),
    fire_pump_model: new FormControl(''),
    fire_pump_flow_rate: new FormControl(0),

    // ปั้มเติมอากาศ
    blower_brand: new FormControl(0),
    blower_model: new FormControl(''),
    blower_airflow_capacity: new FormControl(0),
    blower_airflow_capacity_unit: new FormControl(''),

    // ปั้มจุ่ม
    flow_rate: new FormControl(),

    // กังหันตีน้ำ
    rpm: new FormControl(0),
    voltage: new FormControl(0),
    phase: new FormControl(0),

    // สปริงเกอร์

    // เครื่องสูบน้ำระบบเครื่องยนต์
    water_pump_model: new FormControl(''),
    battery: new FormControl(''),

    // เครื่องสูบน้ำระบบไฟฟ้า

    // แจ้งเหตุเพลิงไหม้
    fcp_model: new FormControl(''),
    cabinet_total: new FormControl(0),
    annuciator_brand: new FormControl(0),

    // ดับเพลิงชะลอ
    
  });

  constructor(private router: Router) {
    
  }

  public save(): void {
  }

  public cancel(): void {
    this.router.navigate(['/admin/assets-list']);
  }
}
