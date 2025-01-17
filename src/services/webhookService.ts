import { supabase } from '../lib/supabaseClient';
import { notificationService } from './notificationService';
import { OpenAI } from 'openai';
import { CallCategory, CallSubCategory, CALL_SUBCATEGORIES } from '../types/callTypes';
import { sendSMSAlert } from './smsService';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

interface WebhookConfig {
  secret: string;
  enabled: boolean;
  retryAttempts: number;
  timeout: number;
}

interface WebhookEvent {
  id: string;
  type: string;
  timestamp: string;
  data: any;
  source: 'rounded' | 'payment' | 'maintenance';
  status: 'pending' | 'processed' | 'failed';
  retryCount: number;
  error?: string;
}

interface WebhookData {
  transcription: string;
  phoneNumber: string;
  machineId?: string;
  laundryId?: string;
  timestamp: string;
}

class WebhookService {
  private static instance: WebhookService;
  private configs: Record<string, WebhookConfig> = {};
  private processingQueue: WebhookEvent[] = [];
  private isProcessing: boolean = false;

  private constructor() {
    this.initializeConfigs();
    this.startProcessingQueue();
  }

  public static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService();
    }
    return WebhookService.instance;
  }

  private initializeConfigs() {
    this.configs = {
      rounded: {
        secret: process.env.VITE_ROUNDED_WEBHOOK_SECRET || '',
        enabled: true,
        retryAttempts: 3,
        timeout: 30000
      },
      payment: {
        secret: process.env.VITE_PAYMENT_WEBHOOK_SECRET || '',
        enabled: true,
        retryAttempts: 3,
        timeout: 30000
      },
      maintenance: {
        secret: process.env.VITE_MAINTENANCE_WEBHOOK_SECRET || '',
        enabled: true,
        retryAttempts: 3,
        timeout: 30000
      }
    };
  }

  private async startProcessingQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const event = this.processingQueue[0];
      try {
        await this.processEvent(event);
        this.processingQueue.shift(); // Retirer l'événement traité
      } catch (error) {
        console.error(`Erreur lors du traitement de l'événement ${event.id}:`, error);
        if (event.retryCount < this.configs[event.source].retryAttempts) {
          event.retryCount++;
          // Déplacer à la fin de la queue pour réessayer plus tard
          this.processingQueue.shift();
          this.processingQueue.push(event);
        } else {
          // Marquer comme échoué
          event.status = 'failed';
          event.error = error.message;
          await this.logToSupportCalls(event);
          this.processingQueue.shift();
        }
      }
    }

    this.isProcessing = false;
  }

  private async processEvent(event: WebhookEvent): Promise<void> {
    // Enregistrer l'événement
    await this.logToSupportCalls(event);

    switch (event.source) {
      case 'rounded':
        await this.handleRoundedEvent(event);
        break;
      case 'payment':
        await this.handlePaymentEvent(event);
        break;
      case 'maintenance':
        await this.handleMaintenanceEvent(event);
        break;
    }

    // Mettre à jour le statut
    event.status = 'processed';
    await this.updateSupportCall(event);
  }

  private async handleRoundedEvent(event: WebhookEvent) {
    const { transcript, call_id, duration } = event.data;

    if (transcript) {
      // Analyser le transcript avec GPT-4
      const analysis = await this.analyzeCall(transcript);

      // Mettre à jour l'appel avec l'analyse
      await this.updateSupportCall({
        ...event,
        data: {
          ...event.data,
          analysis: {
            ...analysis,
            categoryInfo: CALL_SUBCATEGORIES[analysis.subCategory as CallSubCategory]
          },
          processed: true,
        }
      });

      // Gérer les alertes SMS
      await this.handleSMSAlerts(analysis, event);
    }
  }

  private async analyzeCall(transcription: string) {
    const prompt = `Analyser l'appel suivant et catégoriser le problème:
    Transcription: "${transcription}"
    
    Répondre au format JSON avec:
    - category: Catégorie principale (information_request, technical_issue, critical_incident)
    - severity: Niveau de gravité (normal, urgent, critical)
    - requiresTechnician: Booléen si intervention technique nécessaire
    - problemType: Type spécifique du problème
    - clientMood: État d'esprit du client (calme, frustré, en colère)
    - machineImpact: Impact sur la machine (single_machine, multiple_machines)
    - estimatedRevenueLoss: Estimation de la perte potentielle (low, medium, high)
    - summary: Résumé de la situation
    - recommendedActions: Liste d'actions recommandées`;

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    return JSON.parse(response.data.choices[0].message?.content || '{}');
  }

  private async handleSMSAlerts(analysis: any, event: WebhookEvent) {
    // Ne pas envoyer de SMS pour les demandes d'information
    if (analysis.category === 'information_request') {
      return;
    }

    // Récupérer les contacts de support
    const { data: contacts } = await supabase
      .from('support_contacts')
      .select('phone')
      .eq('active', true);

    if (!contacts) return;

    // Vérifier s'il y a des appels similaires récents pour la même machine
    const { data: similarCalls } = await supabase
      .from('support_calls')
      .select('id')
      .eq('machine_id', event.data.machineId)
      .eq('category', analysis.category)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    const isRecurringIssue = similarCalls && similarCalls.length > 1;

    // Déterminer si c'est un incident prioritaire
    const isPriority = 
      analysis.severity === 'critical' ||
      analysis.machineImpact === 'multiple_machines' ||
      analysis.clientMood === 'en colère' ||
      (analysis.problemType === 'payment_terminal' && analysis.severity === 'urgent') ||
      isRecurringIssue;

    // Préparer le message avec le préfixe approprié
    let alertPrefix = '';
    if (isPriority) {
      alertPrefix = '🚨 INCIDENT PRIORITAIRE: ';
    } else if (analysis.category === 'technical_issue') {
      alertPrefix = '⚠️ PROBLÈME SIGNALÉ: ';
    }

    // Préparer et envoyer le message
    const alertMessage = await this.prepareAlertMessage(
      analysis, 
      event, 
      alertPrefix,
      isRecurringIssue
    );

    // Liste des numéros de téléphone qui ont reçu l'alerte
    const recipients: string[] = [];

    // Envoyer à tous les contacts de support
    for (const contact of contacts) {
      try {
        await sendSMSAlert(contact.phone, alertMessage);
        recipients.push(contact.phone);
      } catch (error) {
        console.error(`Erreur lors de l'envoi du SMS à ${contact.phone}:`, error);
      }
    }

    // Enregistrer l'historique de l'alerte
    try {
      await supabase
        .from('sms_alerts_history')
        .insert({
          call_id: event.id,
          machine_id: event.data.machineId,
          laundry_id: event.data.laundryId,
          alert_type: isPriority ? 'critical_incident' : 'technical_issue',
          message: alertMessage,
          recipients,
          is_recurring: isRecurringIssue
        });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'historique des alertes:", error);
    }
  }

  private async prepareAlertMessage(
    analysis: any, 
    event: WebhookEvent, 
    prefix: string,
    isRecurringIssue: boolean
  ): Promise<string> {
    // Récupérer les informations de la laverie
    const { data: laundry } = await supabase
      .from('laundries')
      .select('address, name')
      .eq('id', event.data.laundryId)
      .single();

    // Récupérer les informations de la machine
    const { data: machine } = await supabase
      .from('machines')
      .select('number, type')
      .eq('id', event.data.machineId)
      .single();

    const locationInfo = `${machine?.number || 'Machine'} - ${laundry?.address || 'Adresse inconnue'}`;
    
    let message = `${prefix}${locationInfo}\n\n`;
    message += `⚠️ ${analysis.summary}\n`;

    if (analysis.requiresTechnician) {
      message += "👨‍🔧 Intervention technique requise\n";
    }

    if (isRecurringIssue) {
      message += "⚡ Problème récurrent détecté\n";
    }

    message += "\n";

    if (analysis.recommendedActions?.length > 0) {
      message += "Actions recommandées:\n";
      message += analysis.recommendedActions
        .map((action: string) => `- ${action}`)
        .join("\n");
      message += "\n\n";
    }

    message += `Voir détails: ${process.env.VITE_DASHBOARD_URL}/calls/${event.id}`;

    return message;
  }

  private async handlePaymentEvent(event: WebhookEvent) {
    const { transaction_id, status, amount, machine_id } = event.data;

    // Enregistrer la transaction
    await supabase
      .from('transactions')
      .insert({
        transaction_id,
        status,
        amount,
        machine_id,
        processed_at: new Date().toISOString()
      });

    // Mettre à jour les statistiques de maintenance si nécessaire
    if (status === 'success') {
      await this.updateMaintenanceStats(machine_id, amount);
    }
  }

  private async handleMaintenanceEvent(event: WebhookEvent) {
    const { maintenance_id, type, status, technician_id } = event.data;

    // Mettre à jour le rapport de maintenance
    await supabase
      .from('maintenance_reports')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', maintenance_id);

    // Notifier les parties concernées
    await notificationService.sendNotification({
      type: 'maintenance_update',
      title: `Mise à jour maintenance #${maintenance_id}`,
      message: `La maintenance ${type} est maintenant ${status}`,
      severity: 'info',
      metadata: { maintenance_id, technician_id }
    });
  }

  private async createMaintenanceReport(analysis: any) {
    await supabase
      .from('maintenance_reports')
      .insert({
        title: analysis.problem_title,
        description: analysis.problem_description,
        priority: analysis.urgency_level,
        machine_id: analysis.machine_id,
        status: 'pending',
        created_at: new Date().toISOString()
      });
  }

  private async updateMaintenanceStats(machine_id: string, amount: number) {
    const { data: stats } = await supabase
      .from('maintenance_stats')
      .select('total_cost, total_interventions')
      .eq('machine_id', machine_id)
      .single();

    if (stats) {
      await supabase
        .from('maintenance_stats')
        .update({
          total_cost: stats.total_cost + amount,
          total_interventions: stats.total_interventions + 1,
          last_intervention: new Date().toISOString()
        })
        .eq('machine_id', machine_id);
    }
  }

  private async logToSupportCalls(event: WebhookEvent) {
    await supabase
      .from('support_calls')
      .insert({
        event_id: event.id,
        source: event.source,
        type: event.type,
        status: event.status,
        data: event.data,
        processed_at: new Date().toISOString(),
        error: event.error
      });
  }

  private async updateSupportCall(event: WebhookEvent) {
    await supabase
      .from('support_calls')
      .update({
        status: event.status,
        data: event.data,
        processed_at: new Date().toISOString(),
        error: event.error
      })
      .eq('event_id', event.id);
  }

  // Méthodes publiques pour recevoir les webhooks
  public async handleWebhook(source: WebhookEvent['source'], data: any) {
    const event: WebhookEvent = {
      id: crypto.randomUUID(),
      type: data.type || 'unknown',
      timestamp: new Date().toISOString(),
      data,
      source,
      status: 'pending',
      retryCount: 0
    };

    this.processingQueue.push(event);
    if (!this.isProcessing) {
      this.startProcessingQueue();
    }
  }

  public validateWebhook(source: string, signature: string, payload: string): boolean {
    const config = this.configs[source];
    if (!config || !config.enabled) return false;

    // Implémenter la validation de signature selon le service
    // Pour l'exemple, on retourne true
    return true;
  }
}

// Export singleton instance
export const webhookService = WebhookService.getInstance();
