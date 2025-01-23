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

  const ownerId = await getOwnerIdFromLaundryId(laundryId)
  if (!ownerId) {
    console.error(`No owner found for laundry: ${laundryId}`)
    return
  }

  // Insertion de l'appel principal
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
      owner_id: ownerId,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (callError) {
    console.error('Error inserting call:', callError)
    throw new Error(`Failed to insert call: ${callError.message}`)
  }

  // Gestion des segments d'appel
  if (event.data.task_name) {
    const { error: segmentError } = await supabaseClient
      .from('rounded_call_segments')
      .insert({
        call_id: callData.id,
        task_name: event.data.task_name,
        transcript: event.data.transcript,
        success: true,
        owner_id: ownerId
      })

    if (segmentError) {
      console.error('Error inserting segment:', segmentError)
    }
  }

  // Gestion des variables
  if (event.data.variables) {
    const variables = Object.entries(event.data.variables).map(([name, value]) => ({
      call_id: callData.id,
      name,
      value: String(value),
      type: typeof value as 'string' | 'boolean' | 'number',
      source: 'extracted',
      owner_id: ownerId
    }))

    const { error: variablesError } = await supabaseClient
      .from('rounded_variables')
      .insert(variables)

    if (variablesError) {
      console.error('Error inserting variables:', variablesError)
    }
  }

  // Gestion des outils utilisés
  if (event.data.tool_usage) {
    const { error: toolError } = await supabaseClient
      .from('rounded_tools_usage')
      .insert({
        call_id: callData.id,
        tool_name: event.data.tool_usage.name,
        parameters: event.data.tool_usage.parameters,
        result: event.data.tool_usage.result,
        success: event.data.tool_usage.success,
        error_message: event.data.tool_usage.error_message,
        owner_id: ownerId
      })

    if (toolError) {
      console.error('Error inserting tool usage:', toolError)
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
    const result = await handleCallEvent(event)

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(error.message, { status: 500 })
  }
})
