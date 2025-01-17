export enum MachineStatus {
  OPERATIONAL = 'operational',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
  OFFLINE = 'offline'
}

export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

export interface MonitoringMetrics {
  temperature: number;
  vibration: number;
  waterFlow: number;
  powerConsumption: number;
  cycleTime: number;
  errorRate: number;
  timestamp: string;
}

export interface MaintenancePrediction {
  machineId: string;
  nextMaintenanceDate: Date;
  failureProbability: number;
  recommendedActions: string[];
  estimatedCost: number;
}

export interface PerformanceAlert {
  id: string;
  machineId: string;
  level: AlertLevel;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  metrics: Partial<MonitoringMetrics>;
}

export interface ROIAnalysis {
  machineId: string;
  currentValue: number;
  replacementCost: number;
  monthsToROI: number;
  projectedSavings: number;
  recommendation: string;
  confidenceLevel: number;
}
