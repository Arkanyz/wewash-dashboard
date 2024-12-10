import axios from 'axios';

// L'URL de l'API We-Line en production
const API_URL = import.meta.env.VITE_WELINE_API_URL || 'https://api.we-line.fr';

interface LoginCredentials {
    username: string;
    password: string;
}

interface Machine {
    id: string;
    name: string;
    status: string;
    location: string;
}

interface CallData {
    time: string;
    calls: number;
    duration: number;
}

class WeLineService {
    private token: string | null = null;

    private async request(config: any) {
        if (this.token) {
            config.headers = {
                ...config.headers,
                'Authorization': `Bearer ${this.token}`
            };
        }
        return axios(config);
    }

    async login(credentials: LoginCredentials): Promise<void> {
        try {
            // Encodage des identifiants en Base64 comme attendu par We-Line
            const encodedCredentials = btoa(`${credentials.username}:${credentials.password}`);
            
            const response = await this.request({
                method: 'POST',
                url: `${API_URL}/auth`,
                headers: {
                    'Authorization': `Basic ${encodedCredentials}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.token) {
                this.token = response.data.token;
            } else {
                throw new Error('Token non reçu');
            }
        } catch (error: any) {
            console.error('Erreur de connexion We-Line:', error);
            if (error.response?.status === 401) {
                throw new Error('Identifiants We-Line incorrects');
            }
            throw new Error(error.response?.data?.message || 'Erreur de connexion à We-Line');
        }
    }

    async toggleMachine(machineId: string, action: 'on' | 'off'): Promise<void> {
        try {
            await this.request({
                method: 'POST',
                url: `${API_URL}/machines/${machineId}/${action}`,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error: any) {
            console.error('Erreur toggle machine:', error);
            throw new Error(error.response?.data?.message || `Impossible de ${action === 'on' ? 'démarrer' : 'arrêter'} la machine`);
        }
    }

    async getMachinesList(): Promise<Machine[]> {
        try {
            const response = await this.request({
                method: 'GET',
                url: `${API_URL}/machines`,
            });
            return response.data;
        } catch (error: any) {
            console.error('Erreur récupération machines:', error);
            throw new Error(error.response?.data?.message || 'Impossible de récupérer la liste des machines');
        }
    }

    async getCallsData(date: Date): Promise<CallData[]> {
        try {
            const response = await this.request({
                method: 'GET',
                url: `${API_URL}/calls`,
                params: { date: date.toISOString() }
            });
            return response.data;
        } catch (error: any) {
            console.error('Erreur récupération appels:', error);
            throw new Error(error.response?.data?.message || 'Impossible de récupérer les données d\'appels');
        }
    }

    async logout(): Promise<void> {
        try {
            if (this.token) {
                await this.request({
                    method: 'POST',
                    url: `${API_URL}/logout`
                });
                this.token = null;
            }
        } catch (error: any) {
            console.error('Erreur déconnexion:', error);
            throw new Error(error.response?.data?.message || 'Erreur lors de la déconnexion');
        }
    }
}

export const weLineService = new WeLineService();
