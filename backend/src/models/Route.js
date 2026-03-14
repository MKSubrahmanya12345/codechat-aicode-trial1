// ??$$$ Route Mongoose Schema
const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    origin: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
      address: { type: String },
    },
    destination: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
      address: { type: String },
    },
    waypoints: [
      {
        lat: { type: Number },
        lon: { type: Number },
      },
    ],
    distanceKm: { type: Number, default: 0 },
    durationMinutes: { type: Number, default: 0 },
    estimatedFuelLiters: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Route', routeSchema);
