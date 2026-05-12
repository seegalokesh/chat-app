const router = require('express').Router();
const { body, param } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');
const Room = require('../models/Room');
const Message = require('../models/Message');

router.use(authMiddleware);

// List all rooms
router.get('/', (req, res) => {
  res.json(Room.findAll());
});

// Search rooms
router.get('/search', (req, res) => {
  const { q } = req.query;
  res.json(Room.search(q || ''));
});

// Get single room + members
router.get('/:id', (req, res) => {
  const room = Room.findById(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  const members = Room.getMembers(room.id);
  res.json({ ...room, members });
});

// Create room
router.post('/',
  body('name').trim().isLength({ min: 2, max: 40 }),
  body('description').optional().trim().isLength({ max: 200 }),
  validate,
  (req, res) => {
    const { name, description } = req.body;
    try {
      const room = Room.create({ name, description, createdBy: req.user.id });
      res.status(201).json(room);
    } catch (err) {
      res.status(409).json({ error: 'Room name already taken' });
    }
  }
);

// Join room
router.post('/:id/join', (req, res) => {
  const room = Room.findById(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  Room.addMember(room.id, req.user.id);
  res.json({ success: true });
});

// Leave room
router.post('/:id/leave', (req, res) => {
  Room.removeMember(req.params.id, req.user.id);
  res.json({ success: true });
});

// Get message history (paginated)
router.get('/:id/messages', (req, res) => {
  if (!Room.isMember(req.params.id, req.user.id)) {
    return res.status(403).json({ error: 'Not a member' });
  }
  const limit = parseInt(req.query.limit) || 50;
  const before = req.query.before ? parseInt(req.query.before) : null;
  const messages = Message.getByRoom(req.params.id, limit, before);
  res.json(messages.reverse()); // Return oldest-first
});

module.exports = router;