import axios from 'axios';

const API_URL = 'http://localhost:3001/api/weline';

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
    async login(credentials: LoginCredentials): Promise<void> {
        try {
            await axios.post(`${API_URL}/login`, credentials);
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Erreur de connexion');
        }
    }

    async toggleMachine(machineId: string, action: 'on' | 'off'): Promise<void> {
        try {
            await axios.post(`${API_URL}/machines/toggle`, { machineId, action });
        } catch (error: any) {
            throw new Error(error.response?.data?.error || `Impossible de ${action === 'on' ? 'démarrer' : 'arrêter'} la machine`);
        }
    }

    async getMachinesList(): Promise<Machine[]> {
        try {
            const response = await axios.get(`${API_URL}/machines`);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Impossible de récupérer la liste des machines');
        }
    }

    async getCallsData(date: Date): Promise<CallData[]> {
        try {
            const response = await axios.get(`${API_URL}/calls`, {
                params: { date: date.toISOString() }
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Impossible de récupérer les données d\'appels');
        }
    }

    async logout(): Promise<void> {
        try {
            await axios.post(`${API_URL}/logout`);
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Erreur lors de la déconnexion');
        }
    }
}

export const weLineService = new WeLineService();
