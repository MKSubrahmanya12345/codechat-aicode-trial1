// ??$$$ Driver Mongoose Schema
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema(
  {
    userId: { type: String, unique: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    driverLicenseNumber: { type: String },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-duty', 'off-duty'],
      default: 'active',
    },
    currentLocation: {
      lat: { type: Number, default: 0 },
      lon: { type: Number, default: 0 },
      timestamp: { type: Date, default: Date.now },
    },
    behaviorScore: { type: Number, default: 100, min: 0, max: 100 },
    assignedRoutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Route' }],
  },
  { timestamps: true }
);

// Auto-generate userId before saving
driverSchema.pre('save', async function (next) {
  if (!this.userId) {
    this.userId = `DRV-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Driver', driverSchema);
