// ??$$$ Vehicle routes
const express = require('express');
const router = express.Router();
const { createVehicle, getVehicles, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createVehicle);
router.get('/', protect, getVehicles);
router.put('/:id', protect, updateVehicle);
router.delete('/:id', protect, deleteVehicle);

module.exports = router;
