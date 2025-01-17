import { supabase } from '../lib/supabaseClient';
import { logService } from './logService';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private pushSubscription: PushSubscription | null = null;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  private async initialize() {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        // Enregistrer le Service Worker
        this.swRegistration = await navigator.serviceWorker.register(
          '/service-worker.js'
        );
        
        logService.info('system', 'Service Worker enregistré');

        // Vérifier l'abonnement existant
        const subscription = await this.swRegistration.pushManager.getSubscription();
        if (subscription) {
          this.pushSubscription = subscription;
          logService.info('system', 'Abonnement push existant trouvé');
        }
      }
    } catch (error) {
      logService.error('system', 'Erreur lors de l\'initialisation des notifications push', error);
    }
  }

  public async subscribeToPush() {
    try {
      if (!this.swRegistration) {
        throw new Error('Service Worker non enregistré');
      }

      // Générer les clés VAPID si nécessaire
      const { publicKey } = await this.getVapidKeys();

      // S'abonner aux notifications push
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey)
      });

      this.pushSubscription = subscription;

      // Sauvegarder l'abonnement dans Supabase
      await this.saveSubscription(subscription);

      logService.info('system', 'Abonnement aux notifications push réussi');
      return subscription;
    } catch (error) {
      logService.error('system', 'Erreur lors de l\'abonnement aux notifications push', error);
      throw error;
    }
  }

  public async unsubscribeFromPush() {
    try {
      if (this.pushSubscription) {
        await this.pushSubscription.unsubscribe();
        await this.deleteSubscription(this.pushSubscription);
        this.pushSubscription = null;
        logService.info('system', 'Désabonnement des notifications push réussi');
      }
    } catch (error) {
      logService.error('system', 'Erreur lors du désabonnement des notifications push', error);
      throw error;
    }
  }

  private async getVapidKeys() {
    const { data, error } = await supabase
      .from('vapid_keys')
      .select('public_key')
      .single();

    if (error) {
      throw error;
    }

    return { publicKey: data.public_key };
  }

  private async saveSubscription(subscription: PushSubscription) {
    const { error } = await supabase
      .from('push_subscriptions')
      .insert({
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        user_id: supabase.auth.user()?.id
      });

    if (error) {
      throw error;
    }
  }

  private async deleteSubscription(subscription: PushSubscription) {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .match({ endpoint: subscription.endpoint });

    if (error) {
      throw error;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Méthodes utilitaires pour la gestion des notifications
  public async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      logService.error('system', 'Erreur lors de la demande de permission', error);
      return false;
    }
  }

  public async showNotification(title: string, options: NotificationOptions = {}) {
    try {
      if (!this.swRegistration) {
        throw new Error('Service Worker non enregistré');
      }

      await this.swRegistration.showNotification(title, {
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        ...options
      });

      logService.info('system', 'Notification affichée', { title, options });
    } catch (error) {
      logService.error('system', 'Erreur lors de l\'affichage de la notification', error);
      throw error;
    }
  }
}

export const pushNotificationService = PushNotificationService.getInstance();
