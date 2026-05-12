const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

router.use(authMiddleware);

// Get user's DM conversations
router.get('/', (req, res) => {
  res.json(Conversation.getUserConversations(req.user.id));
});

// Start or get DM with another user
router.post('/:userId', (req, res) => {
  const otherUser = User.findById(req.params.userId);
  if (!otherUser) return res.status(404).json({ error: 'User not found' });
  if (otherUser.id === req.user.id) {
    return res.status(400).json({ error: 'Cannot DM yourself' });
  }
  const conv = Conversation.findOrCreate(req.user.id, otherUser.id);
  res.json(conv);
});

// Get messages in a conversation
router.get('/:id/messages', (req, res) => {
  if (!Conversation.isParticipant(req.params.id, req.user.id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const limit = parseInt(req.query.limit) || 50;
  const before = req.query.before ? parseInt(req.query.before) : null;
  const messages = Message.getByConversation(req.params.id, limit, before);
  res.json(messages.reverse());
});

module.exports = router;