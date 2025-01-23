import { assertEquals, assertExists } from 'https://deno.land/std@0.168.0/testing/asserts.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Mock des variables d'environnement
const TEST_SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? 'http://localhost:54321'
const TEST_SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'your-test-key'
const TEST_WEBHOOK_SECRET = 'test-webhook-secret'

// Client Supabase de test
const supabase = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_KEY)

// Données de test
const mockLaundry = {
  id: crypto.randomUUID(),
  name: 'Laverie Test',
  phone_number: '+33123456789',
  user_id: crypto.randomUUID()
}

const mockEvent = {
  type: 'call.completed',
  call_id: crypto.randomUUID(),
  timestamp: new Date().toISOString(),
  data: {
    caller_number: '+33612345678',
    called_number: mockLaundry.phone_number,
    direction: 'inbound',
    status: 'completed',
    duration: 120,
    recording_url: 'https://example.com/recording.mp3',
    transcript: 'Bonjour, je voudrais savoir si la machine 3 est libre',
    intent: 'check_machine_status',
    task_name: 'machine_availability_check',
    variables: {
      machine_number: 3,
      is_available: true
    },
    tool_usage: {
      name: 'check_machine_status',
      parameters: { machine_id: 3 },
      result: { available: true, end_time: null },
      success: true
    }
  }
}

// Fonction utilitaire pour créer une requête de test
function createTestRequest(event: any, token = TEST_WEBHOOK_SECRET): Request {
  return new Request('http://localhost:8000/webhook', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  })
}

// Configuration avant les tests
async function setupTestData() {
  // Nettoyage des données de test précédentes
  await supabase.from('rounded_calls').delete().eq('caller_number', mockEvent.data.caller_number)
  
  // Création d'une laverie de test
  const { error: laundryError } = await supabase
    .from('laundries')
    .upsert([mockLaundry])

  if (laundryError) throw laundryError
}

// Tests
Deno.test({
  name: "Test de l'authentification du webhook",
  async fn() {
    const req = createTestRequest(mockEvent, 'wrong-token')
    const res = await handleRequest(req)
    assertEquals(res.status, 401)
  }
})

Deno.test({
  name: "Test de la méthode HTTP",
  async fn() {
    const req = new Request('http://localhost:8000/webhook', { method: 'GET' })
    const res = await handleRequest(req)
    assertEquals(res.status, 405)
  }
})

Deno.test({
  name: "Test de l'insertion d'un appel complet",
  async fn() {
    await setupTestData()
    
    const req = createTestRequest(mockEvent)
    const res = await handleRequest(req)
    assertEquals(res.status, 200)

    // Vérification de l'appel
    const { data: call } = await supabase
      .from('rounded_calls')
      .select('*')
      .eq('rounded_call_id', mockEvent.call_id)
      .single()

    assertExists(call)
    assertEquals(call.status, 'completed')
    assertEquals(call.intent, 'check_machine_status')

    // Vérification du segment
    const { data: segment } = await supabase
      .from('rounded_call_segments')
      .select('*')
      .eq('call_id', call.id)
      .single()

    assertExists(segment)
    assertEquals(segment.task_name, 'machine_availability_check')

    // Vérification des variables
    const { data: variables } = await supabase
      .from('rounded_variables')
      .select('*')
      .eq('call_id', call.id)

    assertEquals(variables?.length, 2) // machine_number et is_available

    // Vérification de l'utilisation des outils
    const { data: toolUsage } = await supabase
      .from('rounded_tools_usage')
      .select('*')
      .eq('call_id', call.id)
      .single()

    assertExists(toolUsage)
    assertEquals(toolUsage.tool_name, 'check_machine_status')
    assertEquals(toolUsage.success, true)
  }
})

Deno.test({
  name: "Test de la gestion des erreurs",
  async fn() {
    const invalidEvent = {
      ...mockEvent,
      data: {
        ...mockEvent.data,
        called_number: 'invalid-number' // Numéro qui n'existe pas
      }
    }

    const req = createTestRequest(invalidEvent)
    const res = await handleRequest(req)
    assertEquals(res.status, 500)
  }
})

// Nettoyage après les tests
Deno.test({
  name: "Nettoyage des données de test",
  async fn() {
    await supabase
      .from('rounded_calls')
      .delete()
      .eq('caller_number', mockEvent.data.caller_number)

    await supabase
      .from('laundries')
      .delete()
      .eq('id', mockLaundry.id)
  }
})
