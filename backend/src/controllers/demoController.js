// ??$$$ Demo seeder controller - creates realistic demo data for hackathon judge presentation
const bcrypt = require('bcryptjs');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Route = require('../models/Route');
const RouteAssignment = require('../models/RouteAssignment');
const Invoice = require('../models/Invoice');
const Alert = require('../models/Alert');
const TelemetryLog = require('../models/TelemetryLog');

let ioInstance = null;
const setIO = (io) => { ioInstance = io; };

// ??$$$ Seed realistic Indian logistics demo data
const seedDemoData = async (req, res) => {
  try {
    // ??$$$ Clear existing demo vehicles, routes, alerts, invoices linked to demo drivers
    await Alert.deleteMany({ 'triggeredBy': { $in: ['telemetry_system', 'invoice_system', 'geofence_system'] } });
    await Invoice.deleteMany({ type: 'fuel_claim', amount: { $in: [4200, 9600] } });
    await RouteAssignment.deleteMany({ status: 'in_progress' });
    await Route.deleteMany({ name: { $in: ['Delhi → Mumbai Express', 'Bangalore → Chennai Corridor', 'Hyderabad → Pune Highway'] } });
    await Vehicle.deleteMany({ plateNumber: { $in: ['MH12AB9901', 'DL4CAF2233', 'KA05MN7788'] } });

    // ??$$$ Use upsert with fixed demo userIds - safe to run multiple times, no duplicate key errors
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('demo123', salt);

    const upsertOpts = { upsert: true, new: true, setDefaultsOnInsert: true };

    const raju = await Driver.findOneAndUpdate(
      { email: 'raju.kumar@logiguard.demo' },
      { $set: { userId: 'DRV-DEMO-001', firstName: 'Raju', lastName: 'Kumar',
        email: 'raju.kumar@logiguard.demo', phone: '+91-9845501234',
        driverLicenseNumber: 'DL-MH2022001234', passwordHash: hash,
        status: 'on-duty', behaviorScore: 62,
        currentLocation: { lat: 12.9716, lon: 77.5946, timestamp: new Date() } } },
      upsertOpts
    );

    const priya = await Driver.findOneAndUpdate(
      { email: 'priya.sharma@logiguard.demo' },
      { $set: { userId: 'DRV-DEMO-002', firstName: 'Priya', lastName: 'Sharma',
        email: 'priya.sharma@logiguard.demo', phone: '+91-9900112233',
        driverLicenseNumber: 'DL-DL2021005678', passwordHash: hash,
        status: 'on-duty', behaviorScore: 91,
        currentLocation: { lat: 28.6139, lon: 77.2090, timestamp: new Date() } } },
      upsertOpts
    );

    const vikram = await Driver.findOneAndUpdate(
      { email: 'vikram.singh@logiguard.demo' },
      { $set: { userId: 'DRV-DEMO-003', firstName: 'Vikram', lastName: 'Singh',
        email: 'vikram.singh@logiguard.demo', phone: '+91-8877665544',
        driverLicenseNumber: 'DL-KA2020009876', passwordHash: hash,
        status: 'active', behaviorScore: 45,
        currentLocation: { lat: 12.2958, lon: 76.6394, timestamp: new Date() } } },
      upsertOpts
    );


    // ??$$$ Create 3 vehicles
    const [tataAce, ashokLeyland, mahindra] = await Vehicle.create([
      {
        plateNumber: 'MH12AB9901', make: 'Tata', model: 'Ace Gold',
        year: 2022, fuelType: 'diesel', fuelEfficiencyLitersPerKm: 0.09,
        capacityKg: 1000, status: 'in-use', currentOdometerKm: 48200, driverId: raju._id,
      },
      {
        plateNumber: 'DL4CAF2233', make: 'Ashok Leyland', model: 'BOSS',
        year: 2021, fuelType: 'diesel', fuelEfficiencyLitersPerKm: 0.12,
        capacityKg: 7500, status: 'in-use', currentOdometerKm: 112400, driverId: priya._id,
      },
      {
        plateNumber: 'KA05MN7788', make: 'Mahindra', model: 'Bolero Pickup',
        year: 2023, fuelType: 'diesel', fuelEfficiencyLitersPerKm: 0.10,
        capacityKg: 1500, status: 'available', currentOdometerKm: 23100, driverId: vikram._id,
      },
    ]);

    // ??$$$ Update drivers with vehicle IDs
    await Driver.findByIdAndUpdate(raju._id, { vehicleId: tataAce._id });
    await Driver.findByIdAndUpdate(priya._id, { vehicleId: ashokLeyland._id });
    await Driver.findByIdAndUpdate(vikram._id, { vehicleId: mahindra._id });

    // ??$$$ Create 3 realistic routes
    const [routeDM, routeBC, routeHP] = await Route.create([
      {
        name: 'Delhi → Mumbai Express',
        origin: { lat: 28.6139, lon: 77.2090, address: 'Connaught Place, New Delhi' },
        destination: { lat: 19.0760, lon: 72.8777, address: 'BKC, Mumbai' },
        distanceKm: 1421, durationMinutes: 1560, estimatedFuelLiters: 128,
      },
      {
        name: 'Bangalore → Chennai Corridor',
        origin: { lat: 12.9716, lon: 77.5946, address: 'Whitefield, Bangalore' },
        destination: { lat: 13.0827, lon: 80.2707, address: 'T. Nagar, Chennai' },
        distanceKm: 346, durationMinutes: 360, estimatedFuelLiters: 35,
      },
      {
        name: 'Hyderabad → Pune Highway',
        origin: { lat: 17.3850, lon: 78.4867, address: 'Hitec City, Hyderabad' },
        destination: { lat: 18.5204, lon: 73.8567, address: 'Hinjewadi, Pune' },
        distanceKm: 558, durationMinutes: 600, estimatedFuelLiters: 56,
      },
    ]);

    // ??$$$ Create route assignments
    const now = new Date();
    const [assign1, assign2] = await RouteAssignment.create([
      {
        driverId: raju._id, vehicleId: tataAce._id, routeId: routeBC._id,
        plannedStartTime: new Date(now - 3 * 3600000), plannedEndTime: new Date(now + 3 * 3600000),
        actualStartTime: new Date(now - 3 * 3600000), status: 'in_progress',
      },
      {
        driverId: priya._id, vehicleId: ashokLeyland._id, routeId: routeDM._id,
        plannedStartTime: new Date(now - 2 * 3600000), plannedEndTime: new Date(now + 24 * 3600000),
        actualStartTime: new Date(now - 2 * 3600000), status: 'in_progress',
      },
    ]);

    // ??$$$ Create a CLEAN invoice (normal fuel claim — Priya)
    await Invoice.create({
      driverId: priya._id, vehicleId: ashokLeyland._id,
      type: 'fuel_claim', amount: 4200, currency: 'INR',
      fuelLitersClaimed: 35, status: 'approved', anomalyFlag: false,
      submittedAt: new Date(now - 1 * 3600000),
    });

    // ??$$$ Create ANOMALOUS invoice (Raju claims 120L for a 346km route — expected ~31L)
    const anomalousInvoice = await Invoice.create({
      driverId: raju._id, vehicleId: tataAce._id,
      type: 'fuel_claim', amount: 9600, currency: 'INR',
      fuelLitersClaimed: 120, status: 'flagged', anomalyFlag: true,
      anomalyDetails: {
        type: 'fuel_anomaly',
        score: 88,
        reason: 'Claimed 120L but expected ~31L for 346km route. Deviation of 287% above threshold.',
      },
      submittedAt: new Date(now - 30 * 60000),
    });

    // ??$$$ Create a route deviation alert for Vikram (suspicious offline detour)
    await Alert.create({
      type: 'route_deviation',
      severity: 'critical',
      message: 'Raju Kumar deviated 47km from planned Bangalore→Chennai route. Vehicle spotted near Krishnagiri (unauthorized stop).',
      driverId: raju._id, vehicleId: tataAce._id, routeId: routeBC._id,
      location: { lat: 12.5266, lon: 78.2136 },
      status: 'new',
      details: { anomalyScore: 88, deviationKm: 47, unauthorizedStop: true },
      triggeredBy: 'telemetry_system',
    });

    // ??$$$ Create fuel anomaly alert
    await Alert.create({
      type: 'fuel_anomaly',
      severity: 'high',
      message: 'Raju Kumar submitted fuel claim of 120L vs expected 31L for 346km route. Invoice flagged for review.',
      driverId: raju._id, vehicleId: tataAce._id,
      status: 'new',
      triggeredBy: 'invoice_system',
    });

    // ??$$$ Create geofence breach alert for Vikram
    await Alert.create({
      type: 'geofence_breach',
      severity: 'high',
      message: 'Vikram Singh entered restricted zone: Mysuru Restricted Industrial Area. Authorization required.',
      driverId: vikram._id, vehicleId: mahindra._id,
      location: { lat: 12.2958, lon: 76.6394 },
      status: 'new',
      triggeredBy: 'geofence_system',
    });

    res.json({
      success: true,
      message: 'Demo data seeded successfully!',
      data: {
        drivers: [raju._id, priya._id, vikram._id],
        vehicles: [tataAce._id, ashokLeyland._id, mahindra._id],
        routes: [routeBC._id, routeDM._id, routeHP._id],
      },
    });
  } catch (err) {
    console.error('Demo seed error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ??$$$ Simulate live telemetry — driver deviating from route (for live demo)
const simulateTelemetry = async (req, res) => {
  try {
    const driver = await Driver.findOne({ email: 'raju.kumar@logiguard.demo' });
    if (!driver) return res.status(404).json({ message: 'Run seed first' });

    const route = await Route.findOne({ name: 'Bangalore → Chennai Corridor' });

    // ??$$$ Simulate movement: start from Blr, deviate off route
    const telemetryPoints = [
      { lat: 12.9716, lon: 77.5946, speed: 55 },   // Bangalore start
      { lat: 12.8500, lon: 77.8200, speed: 62 },   // Moving towards Hosur
      { lat: 12.7400, lon: 78.1000, speed: 70 },   // Hosur area
      { lat: 12.5266, lon: 78.2136, speed: 15 },   // DEVIATION — Krishnagiri (off route, slow = suspicious stop)
      { lat: 12.5100, lon: 78.2500, speed: 0 },    // STOPPED at unauthorized location
    ];

    let delay = 0;
    for (const point of telemetryPoints) {
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (ioInstance) {
        ioInstance.emit('driverLocationStream', {
          driverId: driver._id,
          driverName: `${driver.firstName} ${driver.lastName}`,
          lat: point.lat,
          lon: point.lon,
          speedKmh: point.speed,
          timestamp: new Date(),
          routeId: route?._id,
        });
      }

      // Trigger anomaly alert when stopped
      if (point.speed === 0 && ioInstance) {
        ioInstance.emit('anomalyDetected', {
          alertId: 'live-sim-' + Date.now(),
          type: 'route_deviation',
          message: '🚨 LIVE: Raju Kumar STOPPED at unauthorized location near Krishnagiri! Route deviation detected.',
          driverId: driver._id,
          severity: 'critical',
          timestamp: new Date(),
        });
      }
      delay += 1200; // 1.2 seconds between points
    }

    res.json({ success: true, message: 'Telemetry simulation started! Watch the live map.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { seedDemoData, simulateTelemetry, setIO };
