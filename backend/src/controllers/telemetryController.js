// ??$$$ Telemetry controller - real-time GPS data processing with route deviation detection
const TelemetryLog = require('../models/TelemetryLog');
const RouteAssignment = require('../models/RouteAssignment');
const Route = require('../models/Route');
const Alert = require('../models/Alert');
const Driver = require('../models/Driver');
const { haversineDistance, calculateRouteAnomalyScore, updateBehaviorScore } = require('../utils/helpers');

let ioInstance = null;
const setIO = (io) => { ioInstance = io; };

// @desc    Submit GPS telemetry
// @route   POST /api/telemetry
const submitTelemetry = async (req, res) => {
  try {
    const { driverId, vehicleId, latitude, longitude, speedKmh, timestamp, routeId } = req.body;

    // Save telemetry log
    const log = await TelemetryLog.create({
      driverId,
      vehicleId,
      latitude,
      longitude,
      speedKmh: speedKmh || 0,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      routeId,
    });

    // Update driver's current location
    await Driver.findByIdAndUpdate(driverId, {
      currentLocation: { lat: latitude, lon: longitude, timestamp: new Date() },
    });

    // ??$$$ Route deviation detection
    if (routeId) {
      const route = await Route.findById(routeId);
      if (route) {
        const distFromOrigin = haversineDistance(latitude, longitude, route.origin.lat, route.origin.lon);
        const distFromDest = haversineDistance(latitude, longitude, route.destination.lat, route.destination.lon);
        const plannedDist = route.distanceKm;
        const actualPathEstimate = distFromOrigin + distFromDest;
        const anomalyScore = calculateRouteAnomalyScore(plannedDist, actualPathEstimate);

        if (anomalyScore > 50) {
          // Check if recent alert already exists for this driver/route
          const recentAlert = await Alert.findOne({
            driverId,
            routeId,
            type: 'route_deviation',
            createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // within last 5 min
          });

          if (!recentAlert) {
            const alert = await Alert.create({
              type: 'route_deviation',
              severity: anomalyScore > 80 ? 'critical' : 'high',
              message: `Driver deviating from planned route. Anomaly score: ${anomalyScore}`,
              driverId,
              vehicleId,
              routeId,
              location: { lat: latitude, lon: longitude },
              triggeredBy: 'telemetry_system',
            });

            // Deduct behavior score
            const driver = await Driver.findById(driverId);
            if (driver) {
              driver.behaviorScore = updateBehaviorScore(driver.behaviorScore, 5);
              await driver.save();
            }

            // Emit to admin dashboard
            if (ioInstance) {
              ioInstance.emit('anomalyDetected', {
                alertId: alert._id,
                type: 'route_deviation',
                message: alert.message,
                driverId,
                severity: alert.severity,
                timestamp: new Date(),
              });
            }
          }
        }
      }
    }

    // Broadcast location to admin dashboard
    if (ioInstance) {
      ioInstance.emit('driverLocationStream', {
        driverId,
        lat: latitude,
        lon: longitude,
        speedKmh: speedKmh || 0,
        timestamp: new Date(),
      });
    }

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get telemetry history for a driver
// @route   GET /api/telemetry/:driverId
const getTelemetryByDriver = async (req, res) => {
  try {
    const logs = await TelemetryLog.find({ driverId: req.params.driverId })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitTelemetry, getTelemetryByDriver, setIO };
