// ??$$$ Telemetry routes
const express = require('express');
const router = express.Router();
const { submitTelemetry, getTelemetryByDriver } = require('../controllers/telemetryController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, submitTelemetry);
router.get('/:driverId', protect, getTelemetryByDriver);

module.exports = router;
