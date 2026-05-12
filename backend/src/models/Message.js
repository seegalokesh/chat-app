const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Message = {
  create({ content, senderId, roomId, convId }) {
    const db = getDb();
    const id = uuidv4();
    const now = Date.now();
    db.prepare(`
      INSERT INTO messages (id, content, sender_id, room_id, conv_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, content, senderId, roomId || null, convId || null, now, now);
    return this.findById(id);
  },

  findById(id) {
    return getDb().prepare(
      `SELECT m.*, u.username as sender_username, u.avatar as sender_avatar
       FROM messages m JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`
    ).get(id);
  },

  getByRoom(roomId, limit = 50, before = null) {
    if (before) {
      return getDb().prepare(
        `SELECT m.*, u.username as sender_username, u.avatar as sender_avatar
         FROM messages m JOIN users u ON m.sender_id = u.id
         WHERE m.room_id = ? AND m.created_at < ?
         ORDER BY m.created_at DESC LIMIT ?`
      ).all(roomId, before, limit);
    }
    return getDb().prepare(
      `SELECT m.*, u.username as sender_username, u.avatar as sender_avatar
       FROM messages m JOIN users u ON m.sender_id = u.id
       WHERE m.room_id = ?
       ORDER BY m.created_at DESC LIMIT ?`
    ).all(roomId, limit);
  },

  getByConversation(convId, limit = 50, before = null) {
    if (before) {
      return getDb().prepare(
        `SELECT m.*, u.username as sender_username, u.avatar as sender_avatar
         FROM messages m JOIN users u ON m.sender_id = u.id
         WHERE m.conv_id = ? AND m.created_at < ?
         ORDER BY m.created_at DESC LIMIT ?`
      ).all(convId, before, limit);
    }
    return getDb().prepare(
      `SELECT m.*, u.username as sender_username, u.avatar as sender_avatar
       FROM messages m JOIN users u ON m.sender_id = u.id
       WHERE m.conv_id = ?
       ORDER BY m.created_at DESC LIMIT ?`
    ).all(convId, limit);
  },

  update(id, content, userId) {
    const now = Date.now();
    const result = getDb().prepare(
      `UPDATE messages SET content = ?, is_edited = 1, updated_at = ?
       WHERE id = ? AND sender_id = ? AND is_deleted = 0`
    ).run(content, now, id, userId);
    if (result.changes === 0) return null;
    return this.findById(id);
  },

  delete(id, userId) {
    const result = getDb().prepare(
      `UPDATE messages SET is_deleted = 1, content = '[deleted]', updated_at = ?
       WHERE id = ? AND sender_id = ?`
    ).run(Date.now(), id, userId);
    return result.changes > 0;
  },

  markRead(messageId, userId) {
    try {
      getDb().prepare(
        `INSERT OR IGNORE INTO read_receipts (message_id, user_id, read_at) VALUES (?, ?, ?)`
      ).run(messageId, userId, Date.now());
    } catch (_) {}
  },

  getReadReceipts(messageId) {
    return getDb().prepare(
      `SELECT u.id, u.username, rr.read_at
       FROM read_receipts rr JOIN users u ON rr.user_id = u.id
       WHERE rr.message_id = ?`
    ).all(messageId);
  }
};

module.exports = Message;