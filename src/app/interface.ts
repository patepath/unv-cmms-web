export type ServiceRecord = {
  date: string;
  task: string;
  technician: string;
};

export type AssetCondition = 'ใช้งานได้ปกติ' | 'ไม่ได้ใช้งาน' | 'ใช้งานได้แต่ต้องปรับปรุง' | 'ไม่สามารถใช้งานได้';

export type Asset = {
  id: string;
  code: string;
  tag: string;
  category: Category;
  model: string;
  brand_name: string;
  location: Location;
  area: string;
  floor: string;
  owner: string;
  condition: Condition;
  purchase_date: string;
  warranty_end: string;
  last_service: string;
  next_service: string;
  created_at: string;
  updated_at: string;
  service_records: ServiceRecord[];
};

export type Category = {
  id: string;
  name: string;
};

export type Location = {
  id: string;
  name: string;
};

export type Condition = {
  id: string;
  name: AssetCondition;
};

export type AssetDraft = Omit<Asset, 'id' | 'serviceHistory' | 'lastService'> & {
  id: string;
  nextService: string;
};