const SMS_MODE_API_URL = 'https://api.smsmode.com/http/1.6/';

class SMSService {
  private static instance: SMSService;
  private apiKey: string;

  private constructor() {
    this.apiKey = import.meta.env.VITE_SMS_MODE_API_KEY;
    if (!this.apiKey) {
      console.error('Clé API SMS Mode manquante dans les variables d\'environnement');
    }
  }

  public static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  async sendSMS(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const response = await fetch(`${SMS_MODE_API_URL}/sendSMS.do`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          message,
          numero: phoneNumber,
          emetteur: 'WEWASH',
          stop: false
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur SMS Mode: ${response.statusText}`);
      }

      const result = await response.json();
      return result.status === 100;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du SMS:', error);
      return false;
    }
  }
}

export const smsService = SMSService.getInstance();

export const sendSMSAlert = async (phoneNumber: string, message: string): Promise<boolean> => {
  return await smsService.sendSMS(phoneNumber, message);
};
