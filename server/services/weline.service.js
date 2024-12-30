const { chromium } = require('playwright');

class WeLineService {
    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    async initialize() {
        if (!this.browser) {
            this.browser = await chromium.launch({ headless: true });
            this.context = await this.browser.newContext();
            this.page = await this.context.newPage();
        }
    }

    async login({ username, password }) {
        await this.initialize();
        
        try {
            await this.page.goto('https://www.we-line.eu/');
            await this.page.fill('input[name="username"]', username);
            await this.page.fill('input[name="password"]', password);
            await this.page.click('button[type="submit"]');
            
            // Attendre que la page soit chargée
            await this.page.waitForSelector('.dashboard-content', { timeout: 10000 });
            
            return true;
        } catch (error) {
            console.error('Erreur de connexion:', error);
            throw new Error('Échec de la connexion à We-Line');
        }
    }

    async toggleMachine(machineId, action) {
        if (!this.page) {
            throw new Error('Non connecté à We-Line');
        }

        try {
            // Naviguer vers la page des machines
            await this.page.goto('https://www.we-line.eu/machines');
            await this.page.waitForSelector('.machines-list');

            // Trouver la machine spécifique
            const machineSelector = `[data-machine-id="${machineId}"]`;
            await this.page.waitForSelector(machineSelector);

            // Cliquer sur le bouton d'action (on/off)
            const actionButton = `${machineSelector} .toggle-${action}`;
            await this.page.click(actionButton);

            // Attendre la confirmation
            await this.page.waitForSelector('.confirmation-message');

            return true;
        } catch (error) {
            console.error(`Erreur lors du ${action} de la machine:`, error);
            throw new Error(`Impossible de ${action === 'on' ? 'démarrer' : 'arrêter'} la machine`);
        }
    }

    async getMachinesList() {
        if (!this.page) {
            throw new Error('Non connecté à We-Line');
        }

        try {
            await this.page.goto('https://www.we-line.eu/machines');
            await this.page.waitForSelector('.machines-list');

            // Extraire les informations des machines
            const machines = await this.page.evaluate(() => {
                const machineElements = document.querySelectorAll('.machine-item');
                return Array.from(machineElements).map(machine => ({
                    id: machine.dataset.machineId,
                    name: machine.querySelector('.machine-name').textContent,
                    status: machine.querySelector('.machine-status').textContent,
                    location: machine.querySelector('.machine-location').textContent
                }));
            });

            return machines;
        } catch (error) {
            console.error('Erreur lors de la récupération des machines:', error);
            throw new Error('Impossible de récupérer la liste des machines');
        }
    }

    async getCallsData(date) {
        if (!this.page) {
            throw new Error('Non connecté à We-Line');
        }

        try {
            const formattedDate = date.toISOString().split('T')[0];
            await this.page.goto(`https://www.we-line.eu/calls?date=${formattedDate}`);
            await this.page.waitForSelector('.calls-data');

            // Extraire les données d'appels
            const callsData = await this.page.evaluate(() => {
                const dataPoints = document.querySelectorAll('.call-data-point');
                return Array.from(dataPoints).map(point => ({
                    time: point.dataset.time,
                    calls: parseInt(point.dataset.calls),
                    duration: parseInt(point.dataset.duration)
                }));
            });

            return callsData;
        } catch (error) {
            console.error('Erreur lors de la récupération des données d\'appels:', error);
            throw new Error('Impossible de récupérer les données d\'appels');
        }
    }

    async logout() {
        if (this.page) {
            try {
                await this.page.goto('https://www.we-line.eu/logout');
                await this.browser.close();
                this.browser = null;
                this.context = null;
                this.page = null;
            } catch (error) {
                console.error('Erreur lors de la déconnexion:', error);
            }
        }
    }
}

module.exports = new WeLineService();
