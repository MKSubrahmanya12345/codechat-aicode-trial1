// ??$$$ Vehicle Mongoose Schema
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
  {
    plateNumber: { type: String, required: true, unique: true },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    fuelType: {
      type: String,
      enum: ['diesel', 'petrol', 'electric'],
      default: 'diesel',
    },
    fuelEfficiencyLitersPerKm: { type: Number, default: 0.1 },
    capacityKg: { type: Number, default: 1000 },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    status: {
      type: String,
      enum: ['available', 'in-use', 'maintenance'],
      default: 'available',
    },
    currentOdometerKm: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vehicle', vehicleSchema);
