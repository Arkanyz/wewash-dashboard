import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🧪 Test ROUNDED reçu');
  console.log('📝 Body:', JSON.stringify(req.body, null, 2));
  console.log('🔑 Headers:', JSON.stringify(req.headers, null, 2));

  // Test d'insertion simple dans Supabase
  try {
    const { data, error } = await supabase
      .from('rounded_calls')
      .insert({
        call_id: 'test-' + Date.now(),
        caller_number: '+33612345678',
        recipient_number: '+33974993428',
        start_time: new Date().toISOString(),
        status: 'test',
        direction: 'inbound',
        raw_data: { test: true }
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ Test inséré:', data);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('❌ Erreur générale:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
