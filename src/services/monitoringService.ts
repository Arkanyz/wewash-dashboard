import { supabase } from '../lib/supabaseClient';
import { MachineStatus, AlertLevel, MonitoringMetrics } from '../types/monitoringTypes';
import { sendSMSAlert } from './smsService';

interface PerformanceMetrics {
  availability: number;
  efficiency: number;
  quality: number;
  oee: number; // Overall Equipment Effectiveness
}

class MonitoringService {
  private static instance: MonitoringService;
  private alertThresholds = {
    availability: 0.85,
    efficiency: 0.90,
    quality: 0.95,
    temperature: {
      min: 30,
      max: 90
    },
    vibration: {
      max: 2.5 // mm/s RMS
    }
  };

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  async getLaundryPerformance(laundryId: string): Promise<PerformanceMetrics> {
    const { data: machines, error } = await supabase
      .from('machines')
      .select('*')
      .eq('laundry_id', laundryId);

    if (error) throw error;

    const metrics = this.calculatePerformanceMetrics(machines);
    await this.checkAndSendAlerts(laundryId, metrics);
    return metrics;
  }

  async getRealtimeMetrics(machineId: string): Promise<MonitoringMetrics> {
    const { data, error } = await supabase
      .from('machine_metrics')
      .select('*')
      .eq('machine_id', machineId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  }

  async predictMaintenanceNeeds(machineId: string): Promise<{
    nextMaintenanceDate: Date;
    failureProbability: number;
    recommendedActions: string[];
  }> {
    // Récupérer l'historique des métriques
    const { data: metrics, error } = await supabase
      .from('machine_metrics')
      .select('*')
      .eq('machine_id', machineId)
      .order('timestamp', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Analyse des tendances et prédiction
    const analysis = this.analyzeTrends(metrics);
    
    return {
      nextMaintenanceDate: this.predictNextMaintenance(analysis),
      failureProbability: this.calculateFailureProbability(analysis),
      recommendedActions: this.generateRecommendations(analysis)
    };
  }

  async calculateROI(machineId: string): Promise<{
    monthsToROI: number;
    projectedSavings: number;
    recommendation: string;
  }> {
    const { data: machine, error } = await supabase
      .from('machines')
      .select(`
        *,
        maintenance_costs:maintenance_records(cost),
        revenue:usage_records(revenue)
      `)
      .eq('id', machineId)
      .single();

    if (error) throw error;

    // Calcul du ROI basé sur les coûts de maintenance et les revenus
    const analysis = this.analyzeFinancialMetrics(machine);
    
    return {
      monthsToROI: this.calculateMonthsToROI(analysis),
      projectedSavings: this.calculateProjectedSavings(analysis),
      recommendation: this.generateFinancialRecommendation(analysis)
    };
  }

  private calculatePerformanceMetrics(machines: any[]): PerformanceMetrics {
    const metrics = machines.reduce(
      (acc, machine) => {
        acc.availability += machine.uptime / machine.total_time;
        acc.efficiency += machine.actual_cycles / machine.planned_cycles;
        acc.quality += machine.successful_cycles / machine.total_cycles;
        return acc;
      },
      { availability: 0, efficiency: 0, quality: 0 }
    );

    const count = machines.length;
    const availability = metrics.availability / count;
    const efficiency = metrics.efficiency / count;
    const quality = metrics.quality / count;
    const oee = availability * efficiency * quality;

    return { availability, efficiency, quality, oee };
  }

  private async checkAndSendAlerts(laundryId: string, metrics: PerformanceMetrics) {
    const alerts: string[] = [];

    if (metrics.availability < this.alertThresholds.availability) {
      alerts.push(`⚠️ Disponibilité faible (${(metrics.availability * 100).toFixed(1)}%)`);
    }
    if (metrics.efficiency < this.alertThresholds.efficiency) {
      alerts.push(`⚠️ Efficacité réduite (${(metrics.efficiency * 100).toFixed(1)}%)`);
    }
    if (metrics.quality < this.alertThresholds.quality) {
      alerts.push(`⚠️ Qualité en dessous du seuil (${(metrics.quality * 100).toFixed(1)}%)`);
    }

    if (alerts.length > 0) {
      const { data: laundry } = await supabase
        .from('laundries')
        .select('name, contact_phone')
        .eq('id', laundryId)
        .single();

      if (laundry?.contact_phone) {
        const message = `Alertes pour ${laundry.name}:\n${alerts.join('\n')}`;
        await sendSMSAlert(laundry.contact_phone, message);
      }
    }
  }

  private analyzeTrends(metrics: any[]) {
    // Analyse des tendances basée sur l'historique des métriques
    // Utilisation d'algorithmes de régression pour détecter les patterns
    return {
      temperatureTrend: this.calculateTrend(metrics.map(m => m.temperature)),
      vibrationTrend: this.calculateTrend(metrics.map(m => m.vibration)),
      cycleTimeTrend: this.calculateTrend(metrics.map(m => m.cycle_time)),
      errorRateTrend: this.calculateTrend(metrics.map(m => m.error_rate))
    };
  }

  private calculateTrend(values: number[]): number {
    // Calcul simple de la tendance linéaire
    const n = values.length;
    if (n < 2) return 0;

    const xMean = (n - 1) / 2;
    const yMean = values.reduce((a, b) => a + b, 0) / n;

    const slope = values.reduce((acc, y, x) => {
      return acc + (x - xMean) * (y - yMean);
    }, 0) / values.reduce((acc, _, x) => {
      return acc + Math.pow(x - xMean, 2);
    }, 0);

    return slope;
  }

  private predictNextMaintenance(analysis: any): Date {
    // Prédiction basée sur les tendances
    const now = new Date();
    const daysToAdd = Math.max(1, Math.min(30, Math.floor(
      30 * (1 - Math.max(
        analysis.temperatureTrend,
        analysis.vibrationTrend,
        analysis.errorRateTrend
      ))
    )));
    return new Date(now.setDate(now.getDate() + daysToAdd));
  }

  private calculateFailureProbability(analysis: any): number {
    // Calcul de la probabilité de panne basé sur les tendances
    const weights = {
      temperature: 0.3,
      vibration: 0.3,
      cycleTime: 0.2,
      errorRate: 0.2
    };

    return Math.min(1, Math.max(0,
      weights.temperature * Math.abs(analysis.temperatureTrend) +
      weights.vibration * Math.abs(analysis.vibrationTrend) +
      weights.cycleTime * Math.abs(analysis.cycleTimeTrend) +
      weights.errorRate * Math.abs(analysis.errorRateTrend)
    ));
  }

  private generateRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];

    if (Math.abs(analysis.temperatureTrend) > 0.1) {
      recommendations.push("Vérification du système de chauffage recommandée");
    }
    if (Math.abs(analysis.vibrationTrend) > 0.1) {
      recommendations.push("Inspection des roulements et du tambour conseillée");
    }
    if (Math.abs(analysis.cycleTimeTrend) > 0.1) {
      recommendations.push("Optimisation des cycles de lavage nécessaire");
    }
    if (Math.abs(analysis.errorRateTrend) > 0.1) {
      recommendations.push("Maintenance préventive du système de contrôle recommandée");
    }

    return recommendations;
  }

  private analyzeFinancialMetrics(machine: any) {
    const maintenanceCosts = machine.maintenance_costs.reduce((sum: number, record: any) => sum + record.cost, 0);
    const revenue = machine.revenue.reduce((sum: number, record: any) => sum + record.revenue, 0);
    const age = this.calculateMachineAge(machine.installation_date);
    
    return {
      monthlyRevenue: revenue / age,
      monthlyCosts: maintenanceCosts / age,
      efficiency: machine.efficiency,
      replacementCost: machine.replacement_cost
    };
  }

  private calculateMachineAge(installationDate: string): number {
    const now = new Date();
    const installed = new Date(installationDate);
    return Math.max(1, Math.floor((now.getTime() - installed.getTime()) / (30 * 24 * 60 * 60 * 1000)));
  }

  private calculateMonthsToROI(analysis: any): number {
    const monthlyProfit = analysis.monthlyRevenue - analysis.monthlyCosts;
    return Math.ceil(analysis.replacementCost / monthlyProfit);
  }

  private calculateProjectedSavings(analysis: any): number {
    const yearlyMaintenance = analysis.monthlyCosts * 12;
    const newMachineYearlyCost = analysis.replacementCost * 0.1; // Estimation des coûts de maintenance pour une nouvelle machine
    return yearlyMaintenance - newMachineYearlyCost;
  }

  private generateFinancialRecommendation(analysis: any): string {
    const monthlyProfit = analysis.monthlyRevenue - analysis.monthlyCosts;
    const roi = this.calculateMonthsToROI(analysis);
    const savings = this.calculateProjectedSavings(analysis);

    if (roi <= 12 && analysis.efficiency < 0.8) {
      return `Remplacement recommandé. ROI en ${roi} mois avec ${savings.toFixed(2)}€ d'économies annuelles en maintenance.`;
    } else if (roi <= 24 && analysis.efficiency < 0.9) {
      return `Envisager le remplacement dans les 6 prochains mois. Économies potentielles de ${savings.toFixed(2)}€ par an.`;
    } else {
      return `Maintenir la machine actuelle. Rendement satisfaisant avec un profit mensuel de ${monthlyProfit.toFixed(2)}€.`;
    }
  }
}

export const monitoringService = MonitoringService.getInstance();
