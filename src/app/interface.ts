export interface DataTable {
  headerRow: string[];
  footerRow: string[];
  dataRows: string[][];
}

export type Category = {
  id: number;
  name: string;
  group: string;
};

export type Building = {
  id: number;
  code: string;
  name: string;
  created_at: string;
};

export type Brand = {
  id: number;
  name: string;
};

export type Location = {
  id: string;
  name: string;
};

export type Condition = {
  id: string;
  name: string;
};

export type SpecTransformer = {
  id: number;
  transformer_type: string;
  rated_capacity_kva: string;
  unit_of_capacity: string;
  hv_protection_equipment: string;
};

export type SpecGenerator = {
  id: number;
  engine_brand: string;
  engine_model: string;
  engine_power_hp: number | null;
  engine_power_kw: number | null;
  alternator_brand: string;
  alternator_model: string;
  base_rating_kva: number | null;
  base_rating_kw: number | null;
  fuel_tank_capacity: number | null;
  fuel_tank_unit: string;
};

export type SpecElectricalPanel = {
  id: number;
  main_type: string;
  brand: string;
  rate_current: number | null;
  unit_rate_current: string;
  in_iu: string;
  ue: string;
  icu: string;
  ics: string;
  icw: string;
  uimp: string;
  hz: string;
  cat_type: string;
  l_setting: string;
  time_of_l: string;
  s_setting: string;
};

export type SpecFireAlarm = {
  id: number;
  system_type: string;
  fcp_brand: string;
  fcp_model: string;
  cabinet_count: number | null;
  annunciator_brand: string;
  battery_specs: string;
};

export type SpecPump = {
  id: number;
  pump_application: string;
  drive_type: string;
  motor_brand: string;
  motor_model: string;
  power_rating: number | null;
  power_unit: string;
  motor_rpm: string;
  pump_brand: string;
  pump_model: string;
  flow_rate: string;
  flow_rate_unit: string;
  pressure_tank_capacity: string;
  jockey_pump_specs: string;
  battery_specs: string;
};

export type SpecPaddleWheel = {
  id: number;
  power_type: string;
  motor_brand: string;
  model: string;
  power_rating: string;
  power_unit: string;
  rpm_energy_source: string;
};

export type Asset = {
  id: number;
  category_id: number | null;
  category: Category;
  location: string;
  floor: string;
  asset_no: string;
  asset_tag: string;
  buildings: Building[];
  brand_id: number | null;
  brand: Brand;
  model: string;
  unit_number: string;
  spec_transformer_id: number | null;
  spec_transformer: SpecTransformer;
  spec_generator_id: number | null;
  spec_generator: SpecGenerator;
  spec_electrical_panel_id: number | null;
  spec_electrical_panel: SpecElectricalPanel;
  spec_fire_alarm_id: number | null;
  spec_fire_alarm: SpecFireAlarm;
  spec_pump_id: number | null;
  spec_pump: SpecPump;
  spec_paddle_wheel_id: number | null;
  spec_paddle_wheel: SpecPaddleWheel | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type AssetDraft = Partial<Omit<Asset, 'id'>> & {
  id?: number;
  building_ids?: number[];
};
