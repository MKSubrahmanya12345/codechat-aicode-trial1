// ??$$$ Route controller
const Route = require('../models/Route');
const RouteAssignment = require('../models/RouteAssignment');
const Driver = require('../models/Driver');
const { haversineDistance } = require('../utils/helpers');

// @desc    Create route
// @route   POST /api/routes
const createRoute = async (req, res) => {
  try {
    const { name, origin, destination, waypoints } = req.body;

    // Calculate distance automatically if not provided
    let distanceKm = req.body.distanceKm;
    if (!distanceKm) {
      distanceKm = haversineDistance(origin.lat, origin.lon, destination.lat, destination.lon);
    }

    const durationMinutes = req.body.durationMinutes || Math.round(distanceKm * 2); // ~30 km/h urban avg
    const estimatedFuelLiters = req.body.estimatedFuelLiters || parseFloat((distanceKm * 0.1).toFixed(2));

    const route = await Route.create({
      name,
      origin,
      destination,
      waypoints: waypoints || [],
      distanceKm: parseFloat(distanceKm.toFixed(2)),
      durationMinutes,
      estimatedFuelLiters,
    });

    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all routes
// @route   GET /api/routes
const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single route
// @route   GET /api/routes/:id
const getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign route to driver
// @route   POST /api/routes/assign
const assignRoute = async (req, res) => {
  try {
    const { driverId, vehicleId, routeId, plannedStartTime, plannedEndTime } = req.body;

    const assignment = await RouteAssignment.create({
      driverId,
      vehicleId,
      routeId,
      plannedStartTime,
      plannedEndTime,
    });

    // Add route to driver's assignedRoutes
    await Driver.findByIdAndUpdate(driverId, {
      $addToSet: { assignedRoutes: routeId },
      status: 'on-duty',
    });

    await assignment.populate(['driverId', 'vehicleId', 'routeId']);
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all assignments
// @route   GET /api/routes/assignments
const getAssignments = async (req, res) => {
  try {
    const assignments = await RouteAssignment.find()
      .populate('driverId', 'firstName lastName behaviorScore')
      .populate('vehicleId', 'plateNumber make model')
      .populate('routeId', 'name distanceKm durationMinutes');
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createRoute, getRoutes, getRouteById, assignRoute, getAssignments };
