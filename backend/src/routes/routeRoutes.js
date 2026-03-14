// ??$$$ Route routes
const express = require('express');
const router = express.Router();
const { createRoute, getRoutes, getRouteById, assignRoute, getAssignments } = require('../controllers/routeController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/', protect, createRoute);
router.get('/', protect, getRoutes);
router.get('/assignments', protect, getAssignments);
router.get('/:id', protect, getRouteById);
router.post('/assign', protect, assignRoute);

module.exports = router;
