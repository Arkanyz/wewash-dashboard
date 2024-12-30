import { supabase } from '../lib/supabase/client';
import { logService } from './logService';
import { cacheService } from './cacheService';

interface TimeRange {
  startDate: Date;
  endDate: Date;
}

interface AnalyticsMetric {
  value: number;
  previousValue: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface MachineAnalytics {
  totalMachines: number;
  activeMachines: number;
  maintenanceRate: AnalyticsMetric;
  averageUptime: AnalyticsMetric;
  failureRate: AnalyticsMetric;
}

interface InterventionAnalytics {
  totalInterventions: number;
  averageResponseTime: AnalyticsMetric;
  resolutionRate: AnalyticsMetric;
  commonIssues: { issue: string; count: number }[];
}

interface PerformanceAnalytics {
  revenuePerMachine: AnalyticsMetric;
  customerSatisfaction: AnalyticsMetric;
  operationalEfficiency: AnalyticsMetric;
}

class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public async getLaundryAnalytics(laundryId: string, timeRange: TimeRange) {
    const cacheKey = `analytics_${laundryId}_${timeRange.startDate.getTime()}_${timeRange.endDate.getTime()}`;

    try {
      // Vérifier le cache
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Récupérer les données
      const [
        machineAnalytics,
        interventionAnalytics,
        performanceAnalytics
      ] = await Promise.all([
        this.getMachineAnalytics(laundryId, timeRange),
        this.getInterventionAnalytics(laundryId, timeRange),
        this.getPerformanceAnalytics(laundryId, timeRange)
      ]);

      const analytics = {
        machines: machineAnalytics,
        interventions: interventionAnalytics,
        performance: performanceAnalytics,
        generatedAt: new Date()
      };

      // Mettre en cache
      cacheService.set(cacheKey, analytics, { ttl: 30 * 60 * 1000 }); // 30 minutes

      return analytics;
    } catch (error) {
      logService.error('analytics', 'Erreur lors de la récupération des analytics', error);
      throw error;
    }
  }

  private async getMachineAnalytics(
    laundryId: string,
    timeRange: TimeRange
  ): Promise<MachineAnalytics> {
    try {
      // Récupérer les données des machines
      const { data: machines } = await supabase
        .from('machines')
        .select('*')
        .eq('laundry_id', laundryId);

      // Récupérer l'historique de maintenance
      const { data: maintenance } = await supabase
        .from('maintenance_logs')
        .select('*')
        .eq('laundry_id', laundryId)
        .gte('created_at', timeRange.startDate.toISOString())
        .lte('created_at', timeRange.endDate.toISOString());

      // Calculer les métriques
      const maintenanceRate = this.calculateMetric(
        this.getMaintenanceRate(maintenance),
        this.getMaintenanceRate(maintenance, true)
      );

      const averageUptime = this.calculateMetric(
        this.getAverageUptime(machines),
        this.getAverageUptime(machines, true)
      );

      const failureRate = this.calculateMetric(
        this.getFailureRate(maintenance),
        this.getFailureRate(maintenance, true)
      );

      return {
        totalMachines: machines?.length || 0,
        activeMachines: machines?.filter(m => m.status === 'active').length || 0,
        maintenanceRate,
        averageUptime,
        failureRate
      };
    } catch (error) {
      logService.error('analytics', 'Erreur lors du calcul des analytics machines', error);
      throw error;
    }
  }

  private async getInterventionAnalytics(
    laundryId: string,
    timeRange: TimeRange
  ): Promise<InterventionAnalytics> {
    try {
      // Récupérer les interventions
      const { data: interventions } = await supabase
        .from('interventions')
        .select('*')
        .eq('laundry_id', laundryId)
        .gte('created_at', timeRange.startDate.toISOString())
        .lte('created_at', timeRange.endDate.toISOString());

      // Calculer les métriques
      const responseTime = this.calculateMetric(
        this.getAverageResponseTime(interventions),
        this.getAverageResponseTime(interventions, true)
      );

      const resolutionRate = this.calculateMetric(
        this.getResolutionRate(interventions),
        this.getResolutionRate(interventions, true)
      );

      const commonIssues = this.getCommonIssues(interventions);

      return {
        totalInterventions: interventions?.length || 0,
        averageResponseTime: responseTime,
        resolutionRate,
        commonIssues
      };
    } catch (error) {
      logService.error('analytics', 'Erreur lors du calcul des analytics interventions', error);
      throw error;
    }
  }

  private async getPerformanceAnalytics(
    laundryId: string,
    timeRange: TimeRange
  ): Promise<PerformanceAnalytics> {
    try {
      // Récupérer les données de performance
      const { data: performance } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('laundry_id', laundryId)
        .gte('created_at', timeRange.startDate.toISOString())
        .lte('created_at', timeRange.endDate.toISOString());

      // Calculer les métriques
      const revenue = this.calculateMetric(
        this.getRevenuePerMachine(performance),
        this.getRevenuePerMachine(performance, true)
      );

      const satisfaction = this.calculateMetric(
        this.getCustomerSatisfaction(performance),
        this.getCustomerSatisfaction(performance, true)
      );

      const efficiency = this.calculateMetric(
        this.getOperationalEfficiency(performance),
        this.getOperationalEfficiency(performance, true)
      );

      return {
        revenuePerMachine: revenue,
        customerSatisfaction: satisfaction,
        operationalEfficiency: efficiency
      };
    } catch (error) {
      logService.error('analytics', 'Erreur lors du calcul des analytics performance', error);
      throw error;
    }
  }

  private calculateMetric(
    currentValue: number,
    previousValue: number
  ): AnalyticsMetric {
    const change = previousValue === 0 
      ? 0 
      : ((currentValue - previousValue) / previousValue) * 100;

    return {
      value: currentValue,
      previousValue,
      change,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }

  // Méthodes utilitaires pour les calculs
  private getMaintenanceRate(data: any[], previous = false): number {
    // Implémenter le calcul du taux de maintenance
    return 0;
  }

  private getAverageUptime(data: any[], previous = false): number {
    // Implémenter le calcul du temps de fonctionnement moyen
    return 0;
  }

  private getFailureRate(data: any[], previous = false): number {
    // Implémenter le calcul du taux de panne
    return 0;
  }

  private getAverageResponseTime(data: any[], previous = false): number {
    // Implémenter le calcul du temps de réponse moyen
    return 0;
  }

  private getResolutionRate(data: any[], previous = false): number {
    // Implémenter le calcul du taux de résolution
    return 0;
  }

  private getCommonIssues(data: any[]): { issue: string; count: number }[] {
    // Implémenter le calcul des problèmes les plus courants
    return [];
  }

  private getRevenuePerMachine(data: any[], previous = false): number {
    // Implémenter le calcul du revenu par machine
    return 0;
  }

  private getCustomerSatisfaction(data: any[], previous = false): number {
    // Implémenter le calcul de la satisfaction client
    return 0;
  }

  private getOperationalEfficiency(data: any[], previous = false): number {
    // Implémenter le calcul de l'efficacité opérationnelle
    return 0;
  }
}

export const analyticsService = AnalyticsService.getInstance();
