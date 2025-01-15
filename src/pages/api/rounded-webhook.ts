import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Vérification du secret Rounded
const validateRoundedWebhook = (req: NextApiRequest): boolean => {
  const roundedSecret = process.env.ROUNDED_WEBHOOK_SECRET;
  const signature = req.headers['x-rounded-signature'];
  
  if (!roundedSecret || !signature) return false;
  
  // Implémenter la vérification de signature selon la documentation Rounded
  return true;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Vérifier l'authenticité du webhook
  if (!validateRoundedWebhook(req)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const roundedEvent = req.body;
    
    // 1. Insérer les données brutes de l'appel
    const callData = {
      call_id: roundedEvent.id,
      caller_number: roundedEvent.from,
      recipient_number: roundedEvent.to,
      start_time: roundedEvent.startTime,
      end_time: roundedEvent.endTime,
      duration: roundedEvent.duration,
      recording_url: roundedEvent.recordingUrl,
      transcript: roundedEvent.transcript,
      status: roundedEvent.status,
      direction: roundedEvent.direction,
      raw_data: roundedEvent
    };

    // Si c'est un événement de transcription
    if (roundedEvent.type === 'call.transcript.ready' && roundedEvent.transcript) {
      // 2. Analyser le transcript avec GPT-4
      const analysis = await analyzeTranscript(roundedEvent.transcript);

      // 3. Insérer l'appel et son analyse
      const { data: insertedCall, error: insertError } = await supabase
        .rpc('insert_rounded_call', {
          call_data: callData,
          analysis_data: {
            category: analysis.category,
            priority: analysis.priority,
            sentiment: analysis.sentiment,
            summary: analysis.summary,
            keywords: analysis.keywords,
            machine_id: analysis.machineId,
            problem_type: analysis.problemType,
            action_required: analysis.actionRequired,
            action_type: analysis.actionType,
            estimated_resolution_time: analysis.estimatedTime,
            analyzed_by: 'gpt-4'
          }
        });

      if (insertError) throw insertError;

      // 4. Si c'est urgent, créer une action de suivi
      if (analysis.priority === 'high' || analysis.actionRequired) {
        const { data: callDetails } = await supabase
          .rpc('get_call_details', { p_call_id: insertedCall });

        if (callDetails) {
          await supabase.rpc('add_call_action', {
            p_analysis_id: callDetails.analysis_details.id,
            p_action_type: 'urgent_notification',
            p_description: `Appel urgent nécessitant une action immédiate: ${analysis.summary}`,
            p_metadata: {
              caller_number: roundedEvent.from,
              priority: analysis.priority,
              action_type: analysis.actionType
            }
          });
        }
      }
    } else {
      // Si ce n'est pas un événement de transcription, juste sauvegarder l'appel
      const { error: insertError } = await supabase
        .from('rounded_calls')
        .insert(callData);

      if (insertError) throw insertError;
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing Rounded webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function analyzeTranscript(transcript: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Vous êtes un expert en analyse d'appels pour une entreprise de laverie. 
        Analysez le transcript pour extraire les informations clés.
        Répondez au format JSON avec les champs suivants :
        {
          "category": "type d'appel (technique, information, urgence)",
          "priority": "low, medium, high",
          "sentiment": "positif, neutre, négatif",
          "summary": "résumé court de l'appel",
          "keywords": ["mots-clés"],
          "machineId": "ID machine si mentionné",
          "problemType": "type de problème",
          "actionRequired": boolean,
          "actionType": "type d'action nécessaire",
          "estimatedTime": "temps estimé de résolution"
        }`
      },
      {
        role: "user",
        content: transcript
      }
    ]
  });

  return JSON.parse(completion.choices[0].message.content);
}
