const router = require('express').Router();
const { body, param } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');
const Message = require('../models/Message');
const Room = require('../models/Room');
const Conversation = require('../models/Conversation');

router.use(authMiddleware);

// Get message history for a room
router.get('/room/:roomId',
  param('roomId').isUUID(),
  validate,
  (req, res) => {
    const { roomId } = req.params;
    
    // Check if user is a member of the room
    if (!Room.isMember(roomId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const before = req.query.before ? parseInt(req.query.before) : null;
    
    const messages = Message.getByRoom(roomId, limit, before);
    res.json(messages.reverse()); // Return oldest-first
  }
);

// Get message history for a conversation
router.get('/conv/:convId',
  param('convId').isUUID(),
  validate,
  (req, res) => {
    const { convId } = req.params;
    
    // Check if user is a participant
    if (!Conversation.isParticipant(convId, req.user.id)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const before = req.query.before ? parseInt(req.query.before) : null;
    
    const messages = Message.getByConversation(convId, limit, before);
    res.json(messages.reverse()); // Return oldest-first
  }
);

// Get read receipts for a message
router.get('/:messageId/receipts',
  param('messageId').isUUID(),
  validate,
  (req, res) => {
    const receipts = Message.getReadReceipts(req.params.messageId);
    res.json(receipts);
  }
);

// Mark messages as read
router.post('/mark-read',
  body('messageIds').isArray({ min: 1 }),
  validate,
  (req, res) => {
    const { messageIds } = req.body;
    
    messageIds.forEach(id => {
      Message.markRead(id, req.user.id);
    });
    
    res.json({ success: true });
  }
);

module.exports = router;
