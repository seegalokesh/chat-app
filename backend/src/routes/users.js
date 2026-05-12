const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');

router.use(authMiddleware);

router.get('/', (req, res) => {
  const { q } = req.query;
  if (q) return res.json(User.search(q));
  res.json(User.getOnlineUsers());
});

router.get('/:id', (req, res) => {
  const user = User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

module.exports = router;