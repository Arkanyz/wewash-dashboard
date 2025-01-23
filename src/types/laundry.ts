export type LaundrySize = 'small' | 'medium' | 'large';
export type PaymentType = 'card' | 'cash' | 'mobile';
export type MachineType = 'washer' | 'dryer';
export type MachineStatus = 'operational' | 'maintenance' | 'out_of_order';

export interface LaundryFeatures {
  wifi: boolean;
  waiting_area: boolean;
  vending: boolean;
  payment_terminal: boolean;
  air_conditioning: boolean;
  security_cameras: boolean;
}

export interface OpeningHours {
  [day: string]: {
    open: string;
    close: string;
  };
}

export interface Laundry {
  id: string;
  name: string;
  slug: string;
  address: string;
  address_complement?: string;
  code_postal: string;
  ville: string;
  department_id?: number;
  latitude?: number;
  longitude?: number;
  size: LaundrySize;
  opening_hours: OpeningHours;
  accepted_payments: PaymentType[];
  features: LaundryFeatures;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Machine {
  id: string;
  laundry_id: string;
  machine_number: string;
  machine_type: MachineType;
  status: MachineStatus;
  capacity?: number;
  brand?: string;
  model?: string;
  installation_date?: string;
  last_maintenance?: string;
  next_maintenance?: string;
  location_in_store?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Pricing {
  id: string;
  laundry_id: string;
  machine_type: MachineType;
  program_name: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LaundryStatistics {
  id: string;
  name: string;
  ville: string;
  code_postal: string;
  total_machines: number;
  total_washers: number;
  total_dryers: number;
  operational_machines: number;
  maintenance_machines: number;
  broken_machines: number;
}
