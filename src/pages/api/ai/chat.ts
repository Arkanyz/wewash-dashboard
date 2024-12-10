import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Tu es un assistant spécialisé dans la maintenance des machines à laver. Tu dois aider les utilisateurs à diagnostiquer et résoudre les problèmes de leurs machines."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return res.status(200).json({ 
      response: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ 
      message: 'Error processing your request' 
    });
  }
}
