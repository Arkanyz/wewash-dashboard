const weLineService = require('../services/weline.service');

class WeLineController {
    async login(req, res) {
        try {
            const { username, password } = req.body;
            await weLineService.login({ username, password });
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async toggleMachine(req, res) {
        try {
            const { machineId, action } = req.body;
            await weLineService.toggleMachine(machineId, action);
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getMachinesList(req, res) {
        try {
            const machines = await weLineService.getMachinesList();
            res.json(machines);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getCallsData(req, res) {
        try {
            const date = new Date(req.query.date);
            const data = await weLineService.getCallsData(date);
            res.json(data);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async logout(req, res) {
        try {
            await weLineService.logout();
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new WeLineController();
