const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Conversation = {
  findOrCreate(userId1, userId2) {
    const db = getDb();
    // Look for existing DM between these two users
    const existing = db.prepare(`
      SELECT c.id FROM conversations c
      WHERE (SELECT COUNT(*) FROM conv_participants WHERE conv_id = c.id) = 2
        AND EXISTS (SELECT 1 FROM conv_participants WHERE conv_id = c.id AND user_id = ?)
        AND EXISTS (SELECT 1 FROM conv_participants WHERE conv_id = c.id AND user_id = ?)
    `).get(userId1, userId2);

    if (existing) return this.findById(existing.id);

    const id = uuidv4();
    db.prepare(`INSERT INTO conversations (id, created_at) VALUES (?, ?)`).run(id, Date.now());
    db.prepare(`INSERT INTO conv_participants (conv_id, user_id) VALUES (?, ?)`).run(id, userId1);
    db.prepare(`INSERT INTO conv_participants (conv_id, user_id) VALUES (?, ?)`).run(id, userId2);
    return this.findById(id);
  },

  findById(id) {
    return getDb().prepare(`SELECT * FROM conversations WHERE id = ?`).get(id);
  },

  getUserConversations(userId) {
    return getDb().prepare(`
      SELECT c.*,
        u.id as other_user_id, u.username as other_username,
        u.avatar as other_avatar, u.status as other_status,
        (SELECT content FROM messages WHERE conv_id = c.id
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages WHERE conv_id = c.id
         ORDER BY created_at DESC LIMIT 1) as last_message_at
      FROM conversations c
      JOIN conv_participants cp1 ON c.id = cp1.conv_id AND cp1.user_id = ?
      JOIN conv_participants cp2 ON c.id = cp2.conv_id AND cp2.user_id != ?
      JOIN users u ON cp2.user_id = u.id
      ORDER BY last_message_at DESC
    `).all(userId, userId);
  },

  isParticipant(convId, userId) {
    return !!getDb().prepare(
      `SELECT 1 FROM conv_participants WHERE conv_id = ? AND user_id = ?`
    ).get(convId, userId);
  }
};

module.exports = Conversation;