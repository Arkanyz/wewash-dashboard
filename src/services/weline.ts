import axios from 'axios';

// L'URL de l'API Playwright en production
const API_URL = 'http://localhost:3003';

interface LoginCredentials {
    username: string;
    password: string;
}

interface CallData {
    time: string;
    calls: number;
    duration: number;
}

class WeLineService {
    async login(credentials: LoginCredentials): Promise<void> {
        try {
            console.log('Sending login request with:', credentials);
            const response = await axios.post(`${API_URL}/login`, credentials);
            
            if (!response.data.success) {
                throw new Error(response.data.error || 'Erreur de connexion à We-Line');
            }
        } catch (error: any) {
            console.error('Erreur de connexion We-Line:', error);
            
            if (error.response) {
                throw new Error(error.response.data.error || 'Erreur de connexion à We-Line');
            } else if (error.request) {
                throw new Error('Le serveur ne répond pas. Vérifiez qu\'il est démarré.');
            } else {
                throw new Error(error.message || 'Erreur de connexion à We-Line');
            }
        }
    }

    async getCallsData(): Promise<CallData[]> {
        try {
            const response = await axios.get(`${API_URL}/calls`);
            return response.data.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
            throw new Error('Impossible de récupérer les données des appels');
        }
    }
}

export const weLineService = new WeLineService();
