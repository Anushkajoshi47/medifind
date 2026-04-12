/**
 * server.js — Application Entry Point
 *
 * OOSE Concept: Abstraction
 *   - connectDB() hides all Mongoose connection details.
 *   - The server only knows: "connect, then listen."
 */
require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const connectDB = require('./config/database');

const app  = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Serve web frontend
app.use(express.static(path.join(__dirname, '..', 'web')));

// Routes
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/doctors',   require('./routes/doctorRoutes'));
app.use('/api/hospitals', require('./routes/hospitalRoutes'));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', message: 'MediFind API is running (MongoDB)' })
);

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB(); // Abstraction: single call hides Mongoose setup

    // Auto-seed if collections are empty
    const { Doctor } = require('./models');
    const count = await Doctor.countDocuments();
    if (count === 0) {
      console.log('🌱 Empty database — seeding now...');
      await require('./seeders/seed')();
    } else {
      console.log(`✅ Database has ${count} doctors — skipping seed`);
    }

    app.listen(PORT, () => console.log(`🚀 MediFind API running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Startup error:', err.message);
    process.exit(1);
  }
};

startServer();
