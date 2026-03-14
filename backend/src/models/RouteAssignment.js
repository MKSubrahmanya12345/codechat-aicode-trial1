// ??$$$ RouteAssignment Mongoose Schema
const mongoose = require('mongoose');

const routeAssignmentSchema = new mongoose.Schema(
  {
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
    plannedStartTime: { type: Date },
    plannedEndTime: { type: Date },
    actualStartTime: { type: Date },
    actualEndTime: { type: Date },
    status: {
      type: String,
      enum: ['assigned', 'started', 'in_progress', 'completed'],
      default: 'assigned',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RouteAssignment', routeAssignmentSchema);
