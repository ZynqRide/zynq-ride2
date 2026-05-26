const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Unauthorized.' });
  }
  const users = await User.find({}, '-password').sort({ createdAt: -1 });
  res.json({ users });
});

module.exports = router;
