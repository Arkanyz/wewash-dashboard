import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import { createWorker } from 'tesseract.js';
import * as xlsx from 'xlsx';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function parsePriceFile(file: formidable.File) {
  const extension = file.originalFilename?.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'txt':
      return parseTxtFile(file.filepath);
    case 'xlsx':
      return parseXlsxFile(file.filepath);
    case 'jpg':
    case 'jpeg':
    case 'png':
      return parseImageFile(file.filepath);
    default:
      throw new Error('Format de fichier non supporté');
  }
}

async function parseTxtFile(filepath: string): Promise<any[]> {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');
  const prices = [];

  for (const line of lines) {
    const [type, program, duration, price] = line.split(',').map(s => s.trim());
    if (type && program && duration && price) {
      prices.push({
        machine_type: type.toLowerCase() === 'lavage' ? 'washer' : 'dryer',
        program_name: program,
        duration_minutes: parseInt(duration),
        price: parseFloat(price)
      });
    }
  }

  return prices;
}

async function parseXlsxFile(filepath: string): Promise<any[]> {
  const workbook = xlsx.readFile(filepath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  return data.map((row: any) => ({
    machine_type: row.type?.toLowerCase() === 'lavage' ? 'washer' : 'dryer',
    program_name: row.program,
    duration_minutes: parseInt(row.duration),
    price: parseFloat(row.price)
  }));
}

async function parseImageFile(filepath: string): Promise<any[]> {
  const worker = await createWorker('fra');
  const { data: { text } } = await worker.recognize(filepath);
  await worker.terminate();

  // Analyse du texte extrait pour trouver les prix
  const prices = [];
  const lines = text.split('\n');

  for (const line of lines) {
    // Recherche de motifs de prix dans le texte
    const priceMatch = line.match(/(\d+)[€\s]+/);
    const durationMatch = line.match(/(\d+)\s*min/i);
    
    if (priceMatch && durationMatch) {
      const price = parseFloat(priceMatch[1]);
      const duration = parseInt(durationMatch[1]);
      
      // Détermine le type de machine basé sur le contexte
      const type = line.toLowerCase().includes('lavage') ? 'washer' : 'dryer';
      
      prices.push({
        machine_type: type,
        program_name: `Programme ${prices.length + 1}`,
        duration_minutes: duration,
        price: price
      });
    }
  }

  return prices;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  try {
    const form = formidable();
    const [fields, files] = await form.parse(req);
    
    if (!files.priceFile?.[0]) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const file = files.priceFile[0];
    const laundryData = JSON.parse(fields.data?.[0] || '{}');

    // Analyser le fichier de prix
    const prices = await parsePriceFile(file);

    // Insérer la laverie
    const { data: laundry, error: laundryError } = await supabase
      .from('laundries')
      .insert([{
        name: laundryData.name,
        address: laundryData.address,
        ville: laundryData.ville.toUpperCase(),
        code_postal: laundryData.code_postal,
        features: laundryData.features,
        opening_hours: laundryData.opening_hours,
        size: laundryData.size,
        contact_phone: laundryData.contact_phone,
        contact_email: laundryData.contact_email,
        owner_id: req.headers['x-user-id']
      }])
      .select()
      .single();

    if (laundryError) throw laundryError;

    // Insérer les prix
    const { error: priceError } = await supabase
      .from('pricing')
      .insert(
        prices.map(price => ({
          ...price,
          laundry_id: laundry.id
        }))
      );

    if (priceError) throw priceError;

    res.status(200).json({ success: true, data: laundry });
  } catch (error) {
    console.error('Erreur lors de l\'import:', error);
    res.status(500).json({ error: 'Erreur lors de l\'import des prix' });
  }
}
