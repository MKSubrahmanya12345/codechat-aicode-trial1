// ??$$$ Alert routes
const express = require('express');
const router = express.Router();
const { getAlerts, updateAlertStatus, getAlertStats } = require('../controllers/alertController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getAlerts);
router.get('/stats', protect, getAlertStats);
router.put('/:id/status', protect, updateAlertStatus);

module.exports = router;
