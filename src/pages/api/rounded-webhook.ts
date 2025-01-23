import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('⭐ Webhook ROUNDED reçu');
  console.log('📝 Body:', JSON.stringify(req.body, null, 2));
  console.log('🔑 Headers:', JSON.stringify(req.headers, null, 2));

  if (req.method !== 'POST') {
    console.log('❌ Méthode non autorisée:', req.method);
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const roundedEvent = req.body;
    console.log('📞 Données reçues:', roundedEvent);

    // 1. Trouver la laverie
    console.log('🔍 Recherche laverie pour le numéro:', roundedEvent.to);
    const { data: laundryData, error: laundryError } = await supabase
      .rpc('get_laundry_from_phone', {
        p_phone_number: roundedEvent.to
      });

    if (laundryError) {
      console.error('❌ Erreur recherche laverie:', laundryError);
      throw laundryError;
    }

    if (!laundryData || laundryData.length === 0) {
      console.error('❌ Aucune laverie trouvée pour le numéro:', roundedEvent.to);
      throw new Error('Laverie non trouvée');
    }

    const laundry = laundryData[0];
    console.log('✅ Laverie trouvée:', laundry);

    // 2. Insérer l'appel
    const callData = {
      call_id: roundedEvent.id || 'call-' + Date.now(),
      caller_number: roundedEvent.from,
      recipient_number: roundedEvent.to,
      start_time: roundedEvent.startTime || new Date().toISOString(),
      end_time: roundedEvent.endTime,
      duration: roundedEvent.duration,
      recording_url: roundedEvent.recordingUrl,
      transcript: roundedEvent.transcript,
      status: roundedEvent.status || 'received',
      direction: roundedEvent.direction || 'inbound',
      laundry_id: laundry.laundry_id,
      account_id: laundry.account_id,
      raw_data: {
        ...roundedEvent,
        custom_data: {
          machine_number: roundedEvent.machine_number,
          laundry_name: roundedEvent.laundry_name,
          issue_type: roundedEvent.issue_type,
          issue_description: roundedEvent.issue_description,
          machine_type: roundedEvent.machine_type,
          machine_location: roundedEvent.machine_location
        }
      }
    };

    console.log('📝 Tentative insertion appel:', callData);

    const { data: insertedCall, error: insertError } = await supabase
      .from('rounded_calls')
      .insert(callData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erreur insertion:', insertError);
      throw insertError;
    }

    console.log('✅ Appel inséré avec succès:', insertedCall.id);
    return res.status(200).json({ 
      success: true, 
      message: 'Appel enregistré',
      call_id: insertedCall.id 
    });

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return res.status(500).json({ 
      error: 'Erreur serveur', 
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}
