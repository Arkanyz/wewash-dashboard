import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérifier l'authentification
  const { user, error: authError } = await supabase.auth.getUser(req.headers.authorization?.split(' ')[1]);
  if (authError || !user) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  switch (req.method) {
    case 'POST':
      return handlePost(req, res, user.id);
    case 'GET':
      return handleGet(req, res, user.id);
    default:
      return res.status(405).json({ error: 'Méthode non autorisée' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { phone_number, laundry_id } = req.body;

  if (!phone_number || !laundry_id) {
    return res.status(400).json({ error: 'Numéro de téléphone et ID de laverie requis' });
  }

  // Vérifier que la laverie appartient à l'utilisateur
  const { data: laundry, error: laundryError } = await supabase
    .from('laundries')
    .select('id')
    .eq('id', laundry_id)
    .eq('owner_id', userId)
    .single();

  if (laundryError || !laundry) {
    return res.status(403).json({ error: 'Laverie non trouvée ou non autorisée' });
  }

  // Créer l'association
  const { data, error } = await supabase
    .from('phone_mappings')
    .insert({
      phone_number,
      laundry_id,
      account_id: userId,
      is_active: true
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') { // Violation de contrainte unique
      return res.status(409).json({ error: 'Ce numéro est déjà associé à une laverie' });
    }
    return res.status(500).json({ error: 'Erreur lors de la création de l\'association' });
  }

  return res.status(201).json(data);
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { data, error } = await supabase
    .from('phone_mappings')
    .select(`
      *,
      laundry:laundries (
        id,
        name,
        address
      )
    `)
    .eq('account_id', userId)
    .eq('is_active', true);

  if (error) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des associations' });
  }

  return res.status(200).json(data);
}
