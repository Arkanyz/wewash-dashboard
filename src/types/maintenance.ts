export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed';
export type MaintenancePriority = 'urgent' | 'medium' | 'low';
export type MaintenanceType = 'preventive' | 'corrective';

export interface MaintenanceEvent {
  id: string;
  machine_id: string;
  laundry_id: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  description: string;
  predicted_issue?: string;
  created_at: string;
  scheduled_for?: string;
  completed_at?: string;
  technician_notes?: string;
  cost?: number;
}

export interface MachineHealth {
  id: string;
  machine_id: string;
  last_maintenance: string;
  failure_frequency: number;
  health_score: number; // 0-100
  predicted_issues: string[];
  last_updated: string;
}

export interface MaintenanceAlert {
  id: string;
  machine_id: string;
  laundry_id: string;
  type: 'breakdown' | 'prediction';
  priority: MaintenancePriority;
  message: string;
  created_at: string;
  resolved_at?: string;
}
