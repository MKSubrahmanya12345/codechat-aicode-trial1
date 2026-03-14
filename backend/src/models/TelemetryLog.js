// ??$$$ TelemetryLog Mongoose Schema
const mongoose = require('mongoose');

const telemetryLogSchema = new mongoose.Schema(
  {
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    speedKmh: { type: Number, default: 0 },
    headingDeg: { type: Number, default: 0 },
    fuelLevelPercent: { type: Number, default: 100 },
    engineStatus: { type: String, enum: ['on', 'off', 'idle'], default: 'on' },
    timestamp: { type: Date, default: Date.now },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  },
  { timestamps: false }
);

module.exports = mongoose.model('TelemetryLog', telemetryLogSchema);
