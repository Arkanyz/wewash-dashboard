import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Types pour les événements ROUNDED
interface RoundedEvent {
  type: string
  call_id: string
  timestamp: string
  data: {
    caller_number: string
    called_number: string
    direction: 'inbound' | 'outbound'
    status: string
    duration?: number
    recording_url?: string
    transcript?: string
    intent?: string
    task_name?: string
    variables?: Record<string, any>
    tool_usage?: {
      name: string
      parameters?: Record<string, any>
      result?: Record<string, any>
      success: boolean
      error_message?: string
    }
  }
}

// Configuration Supabase
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

async function getLaundryIdFromNumber(phoneNumber: string): Promise<string | null> {
  const { data, error } = await supabaseClient
    .from('laundries')
    .select('id')
    .eq('phone_number', phoneNumber)
    .single()

  if (error || !data) return null
  return data.id
}

async function getOwnerIdFromLaundryId(laundryId: string): Promise<string | null> {
  const { data, error } = await supabaseClient
    .from('laundries')
    .select('owner_id')
    .eq('id', laundryId)
    .single()

  if (error || !data) return null
  return data.owner_id
}

async function handleCallEvent(event: RoundedEvent) {
  const laundryId = await getLaundryIdFromNumber(event.data.called_number)
  if (!laundryId) {
    console.error(`No laundry found for number: ${event.data.called_number}`)
    return
  }

  const userId = await getOwnerIdFromLaundryId(laundryId)
  if (!userId) {
    console.error(`No user found for laundry: ${laundryId}`)
    return
  }

  // Insertion de l'appel principal avec gestion d'erreur améliorée
  const { data: callData, error: callError } = await supabaseClient
    .from('rounded_calls')
    .upsert({
      rounded_call_id: event.call_id,
      caller_number: event.data.caller_number,
      called_number: event.data.called_number,
      direction: event.data.direction,
      status: event.data.status,
      duration: event.data.duration,
      recording_url: event.data.recording_url,
      transcript: event.data.transcript,
      intent: event.data.intent,
      laundry_id: laundryId,
      user_id: userId,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (callError) {
    console.error('Error inserting call:', callError)
    throw new Error(`Failed to insert call: ${callError.message}`)
  }

  // Gestion des segments d'appel avec try-catch
  if (event.data.task_name) {
    try {
      const { error: segmentError } = await supabaseClient
        .from('rounded_call_segments')
        .insert({
          call_id: callData.id,
          task_name: event.data.task_name,
          transcript: event.data.transcript,
          user_id: userId
        })

      if (segmentError) throw segmentError
    } catch (error) {
      console.error('Error inserting call segment:', error)
    }
  }

  // Gestion des variables extraites avec try-catch
  if (event.data.variables) {
    try {
      const variables = Object.entries(event.data.variables).map(([name, value]) => ({
        call_id: callData.id,
        name,
        value: String(value),
        type: typeof value as 'string' | 'boolean' | 'number',
        source: 'extracted',
        user_id: userId
      }))

      if (variables.length > 0) {
        const { error: variablesError } = await supabaseClient
          .from('rounded_variables')
          .insert(variables)

        if (variablesError) throw variablesError
      }
    } catch (error) {
      console.error('Error inserting variables:', error)
    }
  }

  // Gestion de l'utilisation des outils avec try-catch
  if (event.data.tool_usage) {
    try {
      const { error: toolError } = await supabaseClient
        .from('rounded_tools_usage')
        .insert({
          call_id: callData.id,
          tool_name: event.data.tool_usage.name,
          parameters: event.data.tool_usage.parameters,
          result: event.data.tool_usage.result,
          success: event.data.tool_usage.success,
          error_message: event.data.tool_usage.error_message,
          user_id: userId
        })

      if (toolError) throw toolError
    } catch (error) {
      console.error('Error inserting tool usage:', error)
    }
  }

  return callData
}

serve(async (req) => {
  try {
    // Vérification de la méthode
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    // Parsing du corps de la requête
    const event: RoundedEvent = await req.json()

    // Traitement de l'événement
    await handleCallEvent(event)

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})
