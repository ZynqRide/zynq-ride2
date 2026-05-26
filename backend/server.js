const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || null;
const JWT_SECRET = process.env.JWT_SECRET || 'zynq_default_jwt_secret_change_me';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'https://your-netlify-app.netlify.app';

let db = null;
let usersCollection = null;

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow curl/postman
    const allowed = [FRONTEND_ORIGIN];
    if (process.env.NODE_ENV !== 'production') {
      allowed.push('http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000');
    }
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: This origin is not allowed: ' + origin));
  },
};

app.use(cors(corsOptions));

function sanitize(user) {
  if (!user) return null;
  const u = Object.assign({}, user);
  delete u.password;
  return u;
}

async function connectDb() {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI not set. Server will run in fallback mode without DB persistence.');
    return;
  }
  try {
    const client = new MongoClient(MONGODB_URI, { serverApi: ServerApiVersion.v1 });
    await client.connect();
    db = client.db();
    usersCollection = db.collection('users');
    // ensure unique indexes
    await usersCollection.createIndex({ username: 1 }, { unique: true, sparse: true });
    await usersCollection.createIndex({ email: 1 }, { unique: true, sparse: true });
    console.log('Connected to MongoDB');
    // seed owner if provided
    const ownerUsername = (process.env.OWNER_USERNAME || '').toLowerCase();
    const ownerPassword = process.env.OWNER_PASSWORD;
    const ownerEmail = process.env.OWNER_EMAIL || 'owner@zynqride.com';
    if (ownerUsername && ownerPassword) {
      const existing = await usersCollection.findOne({ username: ownerUsername });
      if (!existing) {
        const hash = await bcrypt.hash(ownerPassword, 10);
        await usersCollection.insertOne({
          username: ownerUsername,
          email: ownerEmail,
          password: hash,
          fullName: 'Owner Admin',
          phone: ownerUsername,
          role: 'owner',
          createdAt: new Date(),
          updatedAt: new Date(),
          approved: true,
          verificationStatus: 'approved',
        });
        console.log('Owner seeded:', ownerUsername);
      }
    }
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    db = null; usersCollection = null;
  }
}

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: usersCollection ? 'connected' : 'unavailable' });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { role, username, password, fullName, email, phone } = req.body;
    if (!username || !password || !fullName || !email || !role) return res.status(400).json({ message: 'Missing registration fields.' });

    const normalizedUsername = String(username).trim().toLowerCase();
    const normalizedEmail = String(email).trim().toLowerCase();

    if (usersCollection) {
      const conflict = await usersCollection.findOne({ $or: [{ username: normalizedUsername }, { email: normalizedEmail }, { phone: phone }] });
      if (conflict) return res.status(409).json({ message: 'User already exists with this username/email/phone.' });
      const hash = await bcrypt.hash(password, 10);
      const now = new Date();
      const doc = Object.assign({
        role,
        username: normalizedUsername,
        email: normalizedEmail,
        phone: phone || normalizedUsername,
        password: hash,
        fullName,
        profilePicture: req.body.profilePicture || null,
        verificationStatus: role === 'rider' ? 'approved' : 'pending',
        approved: role === 'rider',
        createdAt: now,
        updatedAt: now,
      }, req.body.role === 'driver' ? {
        nationality: req.body.nationality || 'South African',
        idNumber: req.body.idNumber || '',
        licenseType: req.body.licenseType || '',
        licenseNumber: req.body.licenseNumber || '',
        vehicleRegistration: req.body.vehicleRegistration || '',
        vehicleMake: req.body.vehicleMake || '',
        vehicleModel: req.body.vehicleModel || '',
        vehicleYear: req.body.vehicleYear || '',
        vehicleColor: req.body.vehicleColor || '',
        vehicleType: req.body.vehicleType || '',
        documents: req.body.documents || [],
      } : {});

      const result = await usersCollection.insertOne(doc);
      const user = sanitize(Object.assign({ id: result.insertedId }, doc));
      const token = jwt.sign({ userId: String(result.insertedId), role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user });
    }

    // Fallback: no DB available
    return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
  } catch (err) {
    console.error('Register error', err);
    if (err && err.code === 11000) return res.status(409).json({ message: 'Duplicate key error: user already exists.' });
    return res.status(500).json({ message: 'Failed to register user.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });
    const lookup = String(username).trim();
    const lookupKey = lookup.toLowerCase();

    if (usersCollection) {
      const user = await usersCollection.findOne({ $or: [{ username: lookupKey }, { email: lookupKey }, { phone: lookup }] });
      if (!user) return res.status(404).json({ message: 'User not found.' });
      const ok = await bcrypt.compare(password, user.password || '');
      if (!ok) return res.status(401).json({ message: 'Invalid username or password.' });
      const userSafe = sanitize(user);
      const token = jwt.sign({ userId: String(user._id), role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: userSafe });
    }

    // Fallback: DB unavailable
    return res.status(503).json({ message: 'Database unavailable. Please try again later.' });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Login failed.' });
  }
});

// start
connectDb().then(() => {
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}).catch((err) => {
  console.error('Startup DB connection failed', err && err.message);
  app.listen(PORT, () => console.log(`Backend running on port ${PORT} (DB not connected)`));
});

module.exports = app;
