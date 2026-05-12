const router = require('express').Router();
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { authMiddleware } = require('../middleware/auth');

// Register
router.post('/register',
  body('username').trim().isLength({ min: 3, max: 20 }).isAlphanumeric(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  validate,
  (req, res) => {
    const { username, email, password } = req.body;

    if (User.findByEmail(email)) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    if (User.findByUsername(username)) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const user = User.create({ username, email, password });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    res.status(201).json({ user, token });
  }
);

// Login
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
  (req, res) => {
    const { email, password } = req.body;
    const user = User.findByEmail(email);
    if (!user || !User.comparePassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  }
);

// Get current user
router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

module.exports = router;