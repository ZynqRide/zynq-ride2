const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const tripsRoutes = require('./routes/trips');

const app = express();
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || null;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://your-netlify-app.netlify.app';

const allowedOrigins = [
  FRONTEND_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
];

function isAllowedOrigin(origin) {
  if (!origin) return true; // allow mobile browsers or no-origin clients
  if (allowedOrigins.includes(origin)) return true;
  if (/^https?:\/\/(.+\.)?netlify\.(app|com)$/i.test(origin)) return true;
  if (/^https?:\/\/(.+\.)?vercel\.(app|com)$/i.test(origin)) return true;
  return false;
}

const corsOptions = {
  origin: function (origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error('CORS policy: This origin is not allowed: ' + origin));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  req.dbConnected = mongoose.connection.readyState === 1;
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/trips', tripsRoutes);

async function connectDb() {
  console.log('MONGODB_URI exists:', !!MONGODB_URI);
  
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not set. Server will start without a database connection.');
    return;
  }

  try {
    const uri = MONGODB_URI;
    const hostMatch = uri.match(/@([^/]+)/);
    const host = hostMatch ? hostMatch[1] : 'unknown';
    console.log('MongoDB host:', host);
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.name, '-', error.message);
  }
}

connectDb().finally(() => {
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
});

module.exports = app;
