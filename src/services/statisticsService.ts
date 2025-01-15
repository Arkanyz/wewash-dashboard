import { supabase } from '../lib/supabase/client';

export interface StatisticsData {
  totalCalls: number;
  infoRequests: number;
  problemReports: number;
  criticalIncidents: number;
  trends: {
    calls: string;
    info: string;
    problems: string;
    critical: string;
  };
}

export interface CallStatistics {
  dailyCalls: Array<{
    date: string;
    total: number;
    info: number;
    problem: number;
    resolved: number;
  }>;
  summary: {
    total: number;
    info: number;
    problem: number;
    resolved: number;
    avgResponseTime: string;
  };
}

class StatisticsService {
  async getStatistics(): Promise<StatisticsData> {
    try {
      const { data: supportCalls, error: callsError } = await supabase
        .from('support_calls')
        .select('*');

      if (callsError) throw callsError;

      const { data: maintenanceReports, error: reportsError } = await supabase
        .from('maintenance_reports')
        .select('*');

      if (reportsError) throw reportsError;

      if (!supportCalls && !maintenanceReports) {
        return this.getDefaultStats();
      }

      const totalCalls = supportCalls?.length || 0;
      const infoRequests = supportCalls?.filter(call => call.type === 'information').length || 0;
      const problemReports = maintenanceReports?.length || 0;
      const criticalIncidents = maintenanceReports?.filter(report => report.severity === 'high').length || 0;

      const trends = this.calculateTrends(supportCalls, maintenanceReports);

      return {
        totalCalls,
        infoRequests,
        problemReports,
        criticalIncidents,
        trends
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return this.getDefaultStats();
    }
  }

  async getCallStatistics({ start, end, type = null }: { start: Date; end: Date; type?: string | null }): Promise<CallStatistics> {
    try {
      let query = supabase
        .from('support_calls')
        .select('*')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (type) {
        query = query.eq('type', type);
      }

      const { data: calls, error } = await query;

      if (error) throw error;

      // Organiser les données par jour
      const dailyData = this.organizeDailyData(calls || [], start, end);
      
      // Calculer le résumé
      const summary = this.calculateSummary(calls || []);

      return {
        dailyCalls: dailyData,
        summary
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques d\'appels:', error);
      throw error;
    }
  }

  private getDefaultStats(): StatisticsData {
    return {
      totalCalls: 0,
      infoRequests: 0,
      problemReports: 0,
      criticalIncidents: 0,
      trends: {
        calls: '+0%',
        info: '+0%',
        problems: '+0%',
        critical: '+0'
      }
    };
  }

  private calculateTrends(calls: any[] | null, reports: any[] | null): StatisticsData['trends'] {
    // Pour l'exemple, nous utilisons des valeurs statiques
    // Dans une vraie implémentation, nous comparerions avec la période précédente
    return {
      calls: calls?.length ? '+12%' : '+0%',
      info: calls?.filter(c => c.type === 'information').length ? '+5%' : '+0%',
      problems: reports?.length ? '+8%' : '+0%',
      critical: reports?.filter(r => r.severity === 'high').length ? '+2' : '+0'
    };
  }

  private organizeDailyData(calls: any[], start: Date, end: Date) {
    const dailyData: any[] = [];
    const current = new Date(start);

    while (current <= end) {
      const dayStr = current.toISOString().split('T')[0];
      const dayData = {
        date: dayStr,
        total: 0,
        info: 0,
        problem: 0,
        resolved: 0
      };

      // Filtrer les appels pour ce jour
      const dayCalls = calls.filter(call => 
        call.created_at.split('T')[0] === dayStr
      );

      dayData.total = dayCalls.length;
      dayData.info = dayCalls.filter(call => call.type === 'information').length;
      dayData.problem = dayCalls.filter(call => call.type === 'problem').length;
      dayData.resolved = dayCalls.filter(call => call.status === 'resolved').length;

      dailyData.push(dayData);
      current.setDate(current.getDate() + 1);
    }

    return dailyData;
  }

  private calculateSummary(calls: any[]) {
    const total = calls.length;
    const info = calls.filter(call => call.type === 'information').length;
    const problem = calls.filter(call => call.type === 'problem').length;
    const resolved = calls.filter(call => call.status === 'resolved').length;

    // Calculer le temps de réponse moyen pour les appels résolus
    const resolvedCalls = calls.filter(call => call.resolved_at);
    const avgResponseTime = resolvedCalls.length > 0
      ? resolvedCalls.reduce((acc, call) => {
          const created = new Date(call.created_at);
          const resolved = new Date(call.resolved_at);
          return acc + (resolved.getTime() - created.getTime());
        }, 0) / resolvedCalls.length
      : 0;

    return {
      total,
      info,
      problem,
      resolved,
      avgResponseTime: this.formatResponseTime(avgResponseTime)
    };
  }

  private formatResponseTime(ms: number): string {
    if (ms === 0) return 'N/A';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours}h`;
  }
}

export const statisticsService = new StatisticsService();
