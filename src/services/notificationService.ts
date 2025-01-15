import { supabase } from '@/lib/supabaseClient';
import sgMail from '@sendgrid/mail';

// Configuration de SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'email' | 'sms' | 'in_app';
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
  phoneNumber?: string; // Pour les notifications SMS
}

export class NotificationService {
  // Envoyer une notification
  static async sendNotification(data: NotificationData) {
    try {
      // Créer l'entrée dans la base de données
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          priority: data.priority,
          metadata: {
            ...data.metadata,
            phoneNumber: data.phoneNumber // Stocke le numéro pour les SMS
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Envoyer la notification selon le type
      switch (data.type) {
        case 'email':
          await this.sendEmail(data);
          break;
        case 'sms':
          // Marquer comme "en attente" pour traitement manuel via ROUNDED
          await this.markSMSPending(notification.id);
          break;
        case 'in_app':
          // Déjà géré par l'insertion en base
          break;
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Marquer un SMS comme en attente
  private static async markSMSPending(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({
        status: 'pending_sms',
        metadata: supabase.raw("jsonb_set(metadata, '{sms_status}', '\"pending\"')")
      })
      .eq('id', notificationId);

    if (error) throw error;
  }

  // Envoyer un email via SendGrid
  private static async sendEmail(data: NotificationData) {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured');
    }

    const { email } = await this.getUserDetails(data.userId);
    
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: data.title,
      text: data.message,
      html: this.generateEmailHTML(data)
    });
  }

  // Récupérer les détails de l'utilisateur
  private static async getUserDetails(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('email, phone')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Générer le HTML pour les emails
  private static generateEmailHTML(data: NotificationData) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #286BD4; color: white; padding: 20px; border-radius: 8px; }
            .content { padding: 20px; background: #f9f9f9; border-radius: 8px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.title}</h1>
            </div>
            <div class="content">
              ${data.message}
            </div>
            <div class="footer">
              <p>WeWash - Notification System</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Récupérer les notifications non lues pour un utilisateur
  static async getUnreadNotifications(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .is('read_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Récupérer les SMS en attente
  static async getPendingSMS() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('type', 'sms')
      .eq('status', 'pending_sms')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Marquer un SMS comme envoyé manuellement
  static async markSMSAsSent(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: supabase.raw("jsonb_set(metadata, '{sms_status}', '\"sent\"')")
      })
      .eq('id', notificationId);

    if (error) throw error;
  }

  // Marquer une notification comme lue
  static async markAsRead(notificationId: string) {
    const { error } = await supabase
      .rpc('mark_notification_read', {
        notification_uuid: notificationId
      });

    if (error) throw error;
  }
}
