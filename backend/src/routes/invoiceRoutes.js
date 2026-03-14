// ??$$$ Invoice routes
const express = require('express');
const router = express.Router();
const { submitInvoice, getInvoices, getInvoiceById, updateInvoiceStatus } = require('../controllers/invoiceController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, submitInvoice);
router.get('/', protect, getInvoices);
router.get('/:id', protect, getInvoiceById);
router.put('/:id/status', protect, updateInvoiceStatus);

module.exports = router;
