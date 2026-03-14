// ??$$$ Demo routes for hackathon seeding and live telemetry simulation
const express = require('express');
const router = express.Router();
const { seedDemoData, simulateTelemetry } = require('../controllers/demoController');

// No auth required — these are judge-facing demo endpoints
router.post('/seed', seedDemoData);
router.post('/simulate', simulateTelemetry);

module.exports = router;
