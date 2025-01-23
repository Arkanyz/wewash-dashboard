import { supabase } from '@/lib/supabase';
import type { NextApiRequest, NextApiResponse } from 'next';

// Type pour les données reçues de ROUNDED
interface RoundedWebhookData {
  machine_id: string;
  status: 'started' | 'completed' | 'error';
  timestamp: string;
  cycle_data?: {
    duration: number;
    program: string;
    temperature: number;
    water_consumption: number;
  };
  error_code?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const webhookData = req.body as RoundedWebhookData;

    // Insérer les données dans Supabase
    const { data, error } = await supabase
      .from('machine_cycles')
      .insert([
        {
          machine_id: webhookData.machine_id,
          status: webhookData.status,
          timestamp: webhookData.timestamp,
          duration: webhookData.cycle_data?.duration,
          program: webhookData.cycle_data?.program,
          temperature: webhookData.cycle_data?.temperature,
          water_consumption: webhookData.cycle_data?.water_consumption,
          error_code: webhookData.error_code
        }
      ]);

    if (error) throw error;

    // Mettre à jour le statut de la machine
    const { error: updateError } = await supabase
      .from('machines')
      .update({ 
        last_status: webhookData.status,
        last_update: webhookData.timestamp
      })
      .eq('machine_id', webhookData.machine_id);

    if (updateError) throw updateError;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Erreur webhook ROUNDED:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du traitement des données' 
    });
  }
}
