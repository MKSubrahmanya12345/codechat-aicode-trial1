// ??$$$ Alert Mongoose Schema
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['route_deviation', 'fuel_anomaly', 'timestamp_mismatch', 'geofence_breach'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    message: { type: String, required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
    location: {
      lat: { type: Number },
      lon: { type: Number },
    },
    timestamp: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['new', 'acknowledged', 'resolved', 'false_positive'],
      default: 'new',
    },
    details: { type: mongoose.Schema.Types.Mixed },
    triggeredBy: { type: String, default: 'system' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
