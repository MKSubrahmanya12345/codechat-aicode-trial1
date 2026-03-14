// ??$$$ Invoice Mongoose Schema
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, unique: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    type: {
      type: String,
      enum: ['fuel_claim', 'delivery_summary'],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    fuelLitersClaimed: { type: Number, default: 0 },
    deliveryIds: [{ type: mongoose.Schema.Types.ObjectId }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'pending',
    },
    anomalyFlag: { type: Boolean, default: false },
    anomalyDetails: {
      type: { type: String },
      score: { type: Number },
      reason: { type: String },
    },
    submittedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

// Auto-generate invoice number before saving
invoiceSchema.pre('save', function (next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = `INV-${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
