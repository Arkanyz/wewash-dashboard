import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';
import { vapiConfig } from '../../config/vapi.config';

interface IncidentData {
  // Informations sur l'incident
  incident_id: string;
  timestamp: string;
  
  // Détails du client
  client_id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  preferred_contact_method?: string;
  
  // Détails de la machine
  machine_id: string;
  location?: string;
  machine_type?: string;
  model?: string;
  last_maintenance_date?: string;
  
  // Détails du problème
  problem_type: string;
  description: string;
  detected_by?: string;
  priority: string;
  status?: string;
  recommended_action?: string;
  diagnosis_details?: string;
  classification_source?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Vérifier le token OAuth2
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const data = req.body as IncidentData;
    
    // Validation des données requises
    if (!data.incident_id || !data.client_phone || !data.machine_id) {
      return res.status(400).json({ 
        error: 'Données manquantes' 
      });
    }

    // Vérification de la machine
    const { data: machineInfo, error: machineError } = await supabase
      .from('machines')
      .select('id, model, laundry:laundries!inner(id, name)')
      .eq('id', data.machine_id)
      .single();

    if (machineError || !machineInfo) {
      return res.status(404).json({ 
        error: 'Machine non trouvée' 
      });
    }

    // Enregistrement dans Supabase
    const { data: incidentData, error: incidentError } = await supabase
      .from('incidents')
      .insert({
        incident_id: data.incident_id,
        timestamp: new Date().toISOString(),
        
        // Client Details
        client_id: data.client_id,
        client_name: data.client_name,
        client_phone: data.client_phone,
        client_email: data.client_email,
        preferred_contact_method: data.preferred_contact_method,
        
        // Machine Details
        machine_id: data.machine_id,
        location: data.location || machineInfo.laundry.name,
        machine_type: data.machine_type,
        model: data.model || machineInfo.model,
        last_maintenance_date: data.last_maintenance_date,
        
        // Problem Details
        problem_type: data.problem_type,
        description: data.description,
        detected_by: data.detected_by,
        priority: data.priority,
        status: data.status || 'pending',
        recommended_action: data.recommended_action,
        diagnosis_details: data.diagnosis_details,
        classification_source: data.classification_source
      })
      .select();

    if (incidentError) throw incidentError;

    return res.status(200).json({
      success: true,
      data: incidentData,
      message: 'Incident enregistré avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de l\'incident:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement de l\'incident',
    });
  }
}
