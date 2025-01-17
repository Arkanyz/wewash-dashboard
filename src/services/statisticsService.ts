import { supabase } from '../lib/supabaseClient';
import { CallCategory, CallSubCategory, CALL_CATEGORIES } from '../types/callTypes';

export interface StatisticsData {
  totalCalls: number;
  categoryBreakdown: Record<CallCategory, number>;
  criticalIncidents: number;
  trends: {
    calls: string;
    categories: Record<CallCategory, string>;
    critical: string;
  };
}

export interface CallStatistics {
  dailyCalls: Array<{
    date: string;
    total: number;
    byCategory: Record<CallCategory, number>;
    resolved: number;
  }>;
  summary: {
    total: number;
    byCategory: Record<CallCategory, number>;
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

      if (!supportCalls) {
        return this.getDefaultStats();
      }

      const totalCalls = supportCalls.length;
      
      // Compter les appels par catégorie
      const categoryBreakdown = supportCalls.reduce((acc, call) => {
        acc[call.category] = (acc[call.category] || 0) + 1;
        return acc;
      }, {} as Record<CallCategory, number>);

      // Incidents critiques (priorité critique ou intervention immédiate requise)
      const criticalIncidents = supportCalls.filter(
        call => call.priority === 'critical' || call.requires_immediate
      ).length;

      const trends = this.calculateTrends(supportCalls);

      return {
        totalCalls,
        categoryBreakdown,
        criticalIncidents,
        trends
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return this.getDefaultStats();
    }
  }

  async getCallStatistics({ start, end, category = null }: { 
    start: Date; 
    end: Date; 
    category?: CallCategory | null 
  }): Promise<CallStatistics> {
    try {
      let query = supabase
        .from('support_calls')
        .select('*')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (category) {
        query = query.eq('category', category);
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

  getDefaultStats(): StatisticsData {
    const defaultCategoryBreakdown = Object.keys(CALL_CATEGORIES).reduce((acc, category) => {
      acc[category as CallCategory] = 0;
      return acc;
    }, {} as Record<CallCategory, number>);

    const defaultCategoryTrends = Object.keys(CALL_CATEGORIES).reduce((acc, category) => {
      acc[category as CallCategory] = '+0%';
      return acc;
    }, {} as Record<CallCategory, string>);

    return {
      totalCalls: 0,
      categoryBreakdown: defaultCategoryBreakdown,
      criticalIncidents: 0,
      trends: {
        calls: '+0%',
        categories: defaultCategoryTrends,
        critical: '+0%'
      }
    };
  }

  private calculateTrends(calls: any[]): StatisticsData['trends'] {
    // Calculer les tendances sur les 30 derniers jours vs les 30 jours précédents
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentCalls = calls.filter(call => new Date(call.created_at) >= thirtyDaysAgo);
    const previousCalls = calls.filter(call => 
      new Date(call.created_at) >= sixtyDaysAgo && 
      new Date(call.created_at) < thirtyDaysAgo
    );

    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? '+∞%' : '+0%';
      const change = ((current - previous) / previous) * 100;
      return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`;
    };

    // Tendance globale
    const recentTotal = recentCalls.length;
    const previousTotal = previousCalls.length;
    const callsTrend = calculatePercentageChange(recentTotal, previousTotal);

    // Tendances par catégorie
    const categoryTrends = Object.keys(CALL_CATEGORIES).reduce((acc, category) => {
      const recentCount = recentCalls.filter(call => call.category === category).length;
      const previousCount = previousCalls.filter(call => call.category === category).length;
      acc[category as CallCategory] = calculatePercentageChange(recentCount, previousCount);
      return acc;
    }, {} as Record<CallCategory, string>);

    // Tendance des incidents critiques
    const recentCritical = recentCalls.filter(
      call => call.priority === 'critical' || call.requires_immediate
    ).length;
    const previousCritical = previousCalls.filter(
      call => call.priority === 'critical' || call.requires_immediate
    ).length;
    const criticalTrend = calculatePercentageChange(recentCritical, previousCritical);

    return {
      calls: callsTrend,
      categories: categoryTrends,
      critical: criticalTrend
    };
  }

  private organizeDailyData(calls: any[], start: Date, end: Date) {
    const days: CallStatistics['dailyCalls'] = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      const dayStr = currentDate.toISOString().split('T')[0];
      const dayCalls = calls.filter(call => 
        call.created_at.startsWith(dayStr)
      );

      const byCategory = Object.keys(CALL_CATEGORIES).reduce((acc, category) => {
        acc[category as CallCategory] = dayCalls.filter(call => call.category === category).length;
        return acc;
      }, {} as Record<CallCategory, number>);

      days.push({
        date: dayStr,
        total: dayCalls.length,
        byCategory,
        resolved: dayCalls.filter(call => call.status === 'resolved').length
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }

  private calculateSummary(calls: any[]): CallStatistics['summary'] {
    const byCategory = Object.keys(CALL_CATEGORIES).reduce((acc, category) => {
      acc[category as CallCategory] = calls.filter(call => call.category === category).length;
      return acc;
    }, {} as Record<CallCategory, number>);

    const resolvedCalls = calls.filter(call => call.status === 'resolved');
    const avgResponseTime = resolvedCalls.length > 0
      ? this.formatResponseTime(
          resolvedCalls.reduce((sum, call) => {
            const created = new Date(call.created_at).getTime();
            const resolved = new Date(call.resolved_at).getTime();
            return sum + (resolved - created);
          }, 0) / resolvedCalls.length
        )
      : 'N/A';

    return {
      total: calls.length,
      byCategory,
      resolved: resolvedCalls.length,
      avgResponseTime
    };
  }

  private formatResponseTime(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
}

export const statisticsService = new StatisticsService();
