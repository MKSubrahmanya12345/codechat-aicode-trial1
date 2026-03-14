// ??$$$ Invoice controller with anomaly detection
const Invoice = require('../models/Invoice');
const Route = require('../models/Route');
const RouteAssignment = require('../models/RouteAssignment');
const Alert = require('../models/Alert');
const Driver = require('../models/Driver');
const { detectFuelAnomaly, updateBehaviorScore } = require('../utils/helpers');

let ioInstance = null;
const setIO = (io) => { ioInstance = io; };

// @desc    Submit invoice
// @route   POST /api/invoices
const submitInvoice = async (req, res) => {
  try {
    const { driverId, vehicleId, type, amount, fuelLitersClaimed, deliveryIds } = req.body;

    let anomalyFlag = false;
    let anomalyDetails = {};

    // ??$$$ Fuel anomaly detection logic
    if (type === 'fuel_claim' && fuelLitersClaimed) {
      // Get latest completed assignment for this driver to have distance reference
      const lastAssignment = await RouteAssignment.findOne({
        driverId,
        status: 'completed',
      })
        .sort({ updatedAt: -1 })
        .populate('routeId');

      if (lastAssignment && lastAssignment.routeId) {
        const route = lastAssignment.routeId;
        const isAnomaly = detectFuelAnomaly(
          route.distanceKm,
          0.1, // default fuel efficiency
          fuelLitersClaimed
        );

        if (isAnomaly) {
          anomalyFlag = true;
          const expectedLiters = (route.distanceKm * 0.1).toFixed(2);
          anomalyDetails = {
            type: 'fuel_anomaly',
            score: 75,
            reason: `Claimed ${fuelLitersClaimed}L but expected ~${expectedLiters}L for ${route.distanceKm}km route.`,
          };

          // Create alert
          const alert = await Alert.create({
            type: 'fuel_anomaly',
            severity: 'high',
            message: `Driver submitted suspicious fuel claim: ${fuelLitersClaimed}L vs expected ${expectedLiters}L`,
            driverId,
            vehicleId,
            routeId: route._id,
            triggeredBy: 'invoice_system',
          });

          // Update driver behavior score
          const driver = await Driver.findById(driverId);
          if (driver) {
            driver.behaviorScore = updateBehaviorScore(driver.behaviorScore, 10);
            await driver.save();
          }

          // Emit anomaly via Socket.io
          if (ioInstance) {
            ioInstance.emit('anomalyDetected', {
              alertId: alert._id,
              type: 'fuel_anomaly',
              message: alert.message,
              driverId,
              severity: 'high',
              timestamp: new Date(),
            });
          }
        }
      }
    }

    const invoice = await Invoice.create({
      driverId,
      vehicleId,
      type,
      amount,
      fuelLitersClaimed,
      deliveryIds,
      anomalyFlag,
      anomalyDetails: anomalyFlag ? anomalyDetails : undefined,
      status: anomalyFlag ? 'flagged' : 'pending',
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all invoices
// @route   GET /api/invoices
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('driverId', 'firstName lastName email')
      .populate('vehicleId', 'plateNumber make model')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('driverId')
      .populate('vehicleId');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update invoice status
// @route   PUT /api/invoices/:id/status
const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status, processedAt: new Date() },
      { new: true }
    );
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitInvoice, getInvoices, getInvoiceById, updateInvoiceStatus, setIO };
