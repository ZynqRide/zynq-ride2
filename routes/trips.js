const express = require('express');
const authMiddleware = require('../middleware/auth');
const Trip = require('../models/Trip');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  const { pickup, destination, fare, status, driver, rider } = req.body;
  const trip = await Trip.create({
    user: req.user._id,
    pickup: pickup || '',
    destination: destination || '',
    fare: Number(fare) || 0,
    status: status || 'pending',
    driver: driver || '',
    rider: rider || '',
  });
  res.json({ trip });
});

router.get('/my-trips', authMiddleware, async (req, res) => {
  const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ trips });
});

router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Unauthorized.' });
  }
  const trips = await Trip.find().sort({ createdAt: -1 });
  res.json({ trips });
});

module.exports = router;
