export type PhoneCallStatus = 'ongoing' | 'completed' | 'missed' | 'failed';
export type CallActionType = 'information_request' | 'machine_status' | 'price_inquiry' | 'complaint' | 'other';
export type CallActionStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PhoneCall {
  id: string;
  created_at: string;
  call_id: string;
  caller_number: string;
  status: PhoneCallStatus;
  duration?: number;
  recording_url?: string;
  transcript?: string;
  intent?: string;
  laundry_id?: string;
  owner_id: string;
}

export interface CallAction {
  id: string;
  created_at: string;
  call_id: string;
  action_type: CallActionType;
  action_data: Record<string, any>;
  status: CallActionStatus;
  owner_id: string;
}

export interface RoundedStats {
  total_calls: number;
  missed_calls: number;
  average_duration: number;
  most_common_intent: string;
  calls_by_day: Array<{
    date: string;
    count: number;
  }>;
}
