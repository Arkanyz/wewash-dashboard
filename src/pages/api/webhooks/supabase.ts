import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const event = req.body;
    console.log('Webhook Supabase reçu:', event);

    // Vérifier que c'est bien un INSERT sur rounded_calls
    if (event.type === 'INSERT' && event.table === 'rounded_calls') {
      const newCall = event.record;

      // Si nous avons une transcription, l'analyser
      if (newCall.transcript) {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `Vous êtes un expert en analyse d'appels pour une entreprise de laverie. 
              Analysez le transcript pour extraire les informations clés.
              Les types de problèmes possibles sont : start_failure, stop_failure, water_leak, payment_issue, door_issue, heating_issue, other.
              Répondez au format JSON avec les champs suivants :
              {
                "category": "technique|information|urgence",
                "priority": "low|medium|high",
                "sentiment": "positif|neutre|négatif",
                "summary": "résumé court de l'appel",
                "keywords": ["mots-clés"],
                "machineId": "ID machine si mentionné",
                "problemType": "type de problème parmi la liste ci-dessus",
                "actionRequired": boolean,
                "actionType": "type d'action nécessaire",
                "estimatedTime": "temps estimé de résolution (format PostgreSQL interval)"
              }`
            },
            {
              role: "user",
              content: newCall.transcript
            }
          ]
        });

        const analysis = JSON.parse(completion.choices[0].message.content);

        // Enregistrer l'analyse
        const { error: analysisError } = await supabase
          .from('call_analysis')
          .insert({
            call_id: newCall.id,
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
          });

        if (analysisError) throw analysisError;

        // Si action requise, créer une notification
        if (analysis.actionRequired || analysis.priority === 'high') {
          const { error: actionError } = await supabase
            .from('call_actions')
            .insert({
              analysis_id: newCall.id,
              action_type: 'urgent_notification',
              description: `Action requise: ${analysis.summary}`,
              metadata: {
                priority: analysis.priority,
                problem_type: analysis.problemType,
                caller_number: newCall.caller_number
              }
            });

          if (actionError) throw actionError;
        }
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erreur webhook Supabase:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
