const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'zynqRideSecret';
const JWT_EXPIRES = '7d';
const OWNER_USERNAME = process.env.OWNER_USERNAME?.toLowerCase() || 'owner';
const OWNER_PASSWORD = process.env.OWNER_PASSWORD || 'ZynqRide2025!';
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'owner@zynqride.com';

const fallbackUsers = [];

async function createToken(user) {
  return jwt.sign({ userId: user._id || user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function sanitizeUser(user) {
  if (user && typeof user.toSafeObject === 'function') {
    return user.toSafeObject();
  }

  return {
    id: user.id || user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profilePicture: user.profilePicture,
    verificationStatus: user.verificationStatus,
    approved: user.approved,
    nationality: user.nationality,
    idNumber: user.idNumber,
    licenseType: user.licenseType,
    licenseNumber: user.licenseNumber,
    vehicleRegistration: user.vehicleRegistration,
    vehicleMake: user.vehicleMake,
    vehicleModel: user.vehicleModel,
    vehicleYear: user.vehicleYear,
    vehicleColor: user.vehicleColor,
    vehicleType: user.vehicleType,
    documents: user.documents,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function findFallbackUser(query) {
  const lookupUsername = query.username ? query.username.toLowerCase() : null;
  const lookupEmail = query.email ? query.email.toLowerCase() : null;
  const lookupPhone = query.phone || null;

  return fallbackUsers.find((user) => {
    return (
      (lookupUsername && user.username === lookupUsername) ||
      (lookupEmail && user.email === lookupEmail) ||
      (lookupPhone && user.phone === lookupPhone)
    );
  });
}

async function createFallbackUser(data) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = {
    id: `fallback-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    fullName: data.fullName,
    username: data.username.toLowerCase(),
    email: data.email.toLowerCase(),
    phone: data.phone || data.username,
    password: passwordHash,
    role: data.role,
    profilePicture: data.profilePicture || null,
    verificationStatus: data.verificationStatus || 'pending',
    approved: data.approved || false,
    nationality: data.nationality || 'South African',
    idNumber: data.idNumber || '',
    licenseType: data.licenseType || '',
    licenseNumber: data.licenseNumber || '',
    vehicleRegistration: data.vehicleRegistration || '',
    vehicleMake: data.vehicleMake || '',
    vehicleModel: data.vehicleModel || '',
    vehicleYear: data.vehicleYear || '',
    vehicleColor: data.vehicleColor || '',
    vehicleType: data.vehicleType || '',
    documents: data.documents || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  fallbackUsers.push(user);
  return user;
}

function createFallbackOwner() {
  const existing = fallbackUsers.find((user) => user.username === OWNER_USERNAME);
  if (existing) return existing;
  const owner = {
    id: `fallback-owner`,
    fullName: 'Owner Admin',
    username: OWNER_USERNAME,
    email: OWNER_EMAIL,
    phone: OWNER_USERNAME,
    password: OWNER_PASSWORD,
    role: 'owner',
    profilePicture: null,
    verificationStatus: 'approved',
    approved: true,
    nationality: 'South African',
    idNumber: '',
    licenseType: '',
    licenseNumber: '',
    vehicleRegistration: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    vehicleType: '',
    documents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  fallbackUsers.push(owner);
  return owner;
}

router.post('/register', async (req, res) => {
  try {
    const { role, username, password, fullName, email, phone, profilePicture, nationality } = req.body;
    if (!username || !password || !fullName || !email || !role) {
      return res.status(400).json({ message: 'Missing registration fields.' });
    }

    const driverFields = ['idNumber', 'licenseType', 'licenseNumber', 'vehicleRegistration', 'vehicleMake', 'vehicleModel', 'vehicleYear', 'vehicleColor', 'vehicleType'];
    let driverData = {};

    if (role === 'driver') {
      const {
        idNumber,
        licenseType,
        licenseNumber,
        vehicleRegistration,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehicleColor,
        vehicleType,
        documents,
      } = req.body;

      if (!idNumber || !licenseType || !licenseNumber || !vehicleRegistration || !vehicleMake || !vehicleModel || !vehicleYear || !vehicleColor || !vehicleType) {
        return res.status(400).json({ message: 'Missing required driver registration fields.' });
      }

      driverData = {
        nationality: nationality || 'South African',
        idNumber,
        licenseType,
        licenseNumber,
        vehicleRegistration,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehicleColor,
        vehicleType,
        documents: documents || [],
      };
    }

    const userData = {
      role,
      username: username.toLowerCase(),
      password,
      fullName,
      email: email.toLowerCase(),
      phone: phone || username,
      profilePicture: profilePicture || null,
      approved: role === 'rider',
      verificationStatus: role === 'rider' ? 'approved' : 'pending',
      ...driverData,
    };

    if (req.dbConnected) {
      const existingUser = await User.findOne({ $or: [{ username: userData.username }, { email: userData.email }] });
      if (existingUser) {
        return res.status(409).json({ message: 'User already exists with this username or email.' });
      }

      const user = await User.create(userData);
      const token = await createToken(user);
      return res.json({ token, user: sanitizeUser(user) });
    }

    const existingUser = await findFallbackUser({ username: userData.username, email: userData.email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this username or email.' });
    }

    const user = await createFallbackUser(userData);
    const token = await createToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to register user.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const lookup = username.trim();
    const lookupKey = lookup.toLowerCase();

    if (req.dbConnected) {
      const user = await User.findOne({
        $or: [
          { username: lookupKey },
          { phone: lookup },
          { email: lookupKey },
        ],
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const validPassword = await user.comparePassword(password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid username or password.' });
      }

      const token = await createToken(user);
      return res.json({ token, user: sanitizeUser(user) });
    }

    if (lookupKey === OWNER_USERNAME && password === OWNER_PASSWORD) {
      const ownerUser = createFallbackOwner();
      const token = await createToken(ownerUser);
      return res.json({ token, user: sanitizeUser(ownerUser) });
    }

    const user = await findFallbackUser({ username: lookupKey, email: lookupKey, phone: lookup });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const validPassword = user.password === password ? true : await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = await createToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed.' });
  }
});

module.exports = router;
