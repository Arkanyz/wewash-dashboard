import { supabase } from '../lib/supabaseClient';
import type { PhoneCall, CallAction, RoundedStats } from '../types/rounded';

export class RoundedService {
  static async getPhoneCalls(laundryId?: string) {
    const query = supabase
      .from('phone_calls')
      .select('*')
      .order('created_at', { ascending: false });

    if (laundryId) {
      query.eq('laundry_id', laundryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as PhoneCall[];
  }

  static async getCallActions(callId: string) {
    const { data, error } = await supabase
      .from('call_actions')
      .select('*')
      .eq('call_id', callId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as CallAction[];
  }

  static async getStats(laundryId?: string, startDate?: Date, endDate?: Date): Promise<RoundedStats> {
    const query = supabase.rpc('get_rounded_stats', {
      p_laundry_id: laundryId,
      p_start_date: startDate?.toISOString(),
      p_end_date: endDate?.toISOString()
    });

    const { data, error } = await query;
    if (error) throw error;
    return data as RoundedStats;
  }

  static async updateCallStatus(callId: string, status: PhoneCall['status']) {
    const { error } = await supabase
      .from('phone_calls')
      .update({ status })
      .eq('call_id', callId);

    if (error) throw error;
  }

  static async linkCallToLaundry(callId: string, laundryId: string) {
    const { error } = await supabase
      .from('phone_calls')
      .update({ laundry_id: laundryId })
      .eq('call_id', callId);

    if (error) throw error;
  }
}
