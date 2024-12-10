const express = require('express');
const router = express.Router();
const weLineController = require('../controllers/weline.controller');

router.post('/login', weLineController.login);
router.post('/machines/toggle', weLineController.toggleMachine);
router.get('/machines', weLineController.getMachinesList);
router.get('/calls', weLineController.getCallsData);
router.post('/logout', weLineController.logout);

module.exports = router;
