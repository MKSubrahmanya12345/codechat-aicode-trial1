// ??$$$ Main backend entry point - Express + Socket.io server
require('dotenv').config();
const { exec } = require('child_process'); // ??$$$ for port cleanup
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorMiddleware } = require('./middlewares/errorMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const driverRoutes = require('./routes/driverRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const routeRoutes = require('./routes/routeRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const telemetryRoutes = require('./routes/telemetryRoutes');
const alertRoutes = require('./routes/alertRoutes');
const demoRoutes = require('./routes/demoRoutes'); // ??$$$ Hackathon demo routes

// Import controllers that need IO instance
const telemetryController = require('./controllers/telemetryController');
const invoiceController = require('./controllers/invoiceController');
const demoController = require('./controllers/demoController'); // ??$$$

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// ??$$$ CORS - allow localhost in dev AND the deployed Vercel frontend URL in prod
const FRONTEND_URL = process.env.FRONTEND_URL || '';
const corsOrigin = (origin, callback) => {
  const allowed =
    !origin ||
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:') ||
    (FRONTEND_URL && origin === FRONTEND_URL) ||
    origin.endsWith('.vercel.app'); // ??$$$ allow all vercel preview URLs too
  if (allowed) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
});

// Pass io to controllers that need it
telemetryController.setIO(io);
invoiceController.setIO(io);
demoController.setIO(io); // ??$$$ for live telemetry simulation

// Middleware
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), service: 'Logistics Guardian API' });
});

// ??$$$ API routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/demo', demoRoutes); // ??$$$ Hackathon judge demo

// Error middleware (must be last)
app.use(errorMiddleware);

// ??$$$ Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Driver sends location update via WebSocket
  socket.on('driverLocationUpdate', async (data) => {
    const { lat, lon, speedKmh, timestamp, routeAssignmentId, driverId } = data;
    // Broadcast to all admin clients
    io.emit('driverLocationStream', {
      driverId,
      lat,
      lon,
      speedKmh,
      timestamp: timestamp || new Date(),
    });
  });

  // Driver status update
  socket.on('driverStatusUpdate', (data) => {
    io.emit('driverStatusChanged', data);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ??$$$ Smart server start – auto-kills port if EADDRINUSE, then retries
const PORT = process.env.PORT || 5000;

const startServer = (retried = false) => {
  server.listen(PORT, () => {
    console.log(`\n🚀 Logistics Guardian API running on port ${PORT}`);
    console.log(`📡 Socket.io ready for real-time events`);
    console.log(`🌐 Health: http://localhost:${PORT}/api/health\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && !retried) {
      console.warn(`⚠️  Port ${PORT} in use — killing existing process and retrying...`);
      // Kill the process holding the port (Windows)
      exec(
        `for /f "tokens=5" %a in ('netstat -aon ^| findstr :${PORT}') do taskkill /F /PID %a`,
        () => {
          server.removeAllListeners('error');
          // Brief wait then retry
          setTimeout(() => startServer(true), 800);
        }
      );
    } else {
      console.error(`❌ Server error:`, err.message);
      process.exit(1);
    }
  });
};

startServer();
