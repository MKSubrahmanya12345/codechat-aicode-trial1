// ??$$$ Alert controller
const Alert = require('../models/Alert');

// @desc    Get all alerts
// @route   GET /api/alerts
const getAlerts = async (req, res) => {
  try {
    const { status, severity, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (type) filter.type = type;

    const alerts = await Alert.find(filter)
      .populate('driverId', 'firstName lastName behaviorScore')
      .populate('vehicleId', 'plateNumber make model')
      .populate('routeId', 'name')
      .sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update alert status
// @route   PUT /api/alerts/:id/status
const updateAlertStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!alert) return res.status(404).json({ message: 'Alert not found' });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard summary stats
// @route   GET /api/alerts/stats
const getAlertStats = async (req, res) => {
  try {
    const total = await Alert.countDocuments();
    const byStatus = await Alert.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const bySeverity = await Alert.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);
    const byType = await Alert.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
    res.json({ total, byStatus, bySeverity, byType });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAlerts, updateAlertStatus, getAlertStats };
