const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Room = {
  create({ name, description, createdBy }) {
    const db = getDb();
    const id = uuidv4();
    const now = Date.now();
    db.prepare(`
      INSERT INTO rooms (id, name, description, created_by, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, description || '', createdBy, now);
    // Creator auto-joins
    this.addMember(id, createdBy);
    return this.findById(id);
  },

  findById(id) {
    return getDb().prepare(`SELECT * FROM rooms WHERE id = ?`).get(id);
  },

  findAll() {
    return getDb().prepare(
      `SELECT r.*, COUNT(rm.user_id) as member_count
       FROM rooms r
       LEFT JOIN room_members rm ON r.id = rm.room_id
       GROUP BY r.id ORDER BY r.created_at DESC`
    ).all();
  },

  search(query) {
    return getDb().prepare(
      `SELECT * FROM rooms WHERE name LIKE ? LIMIT 20`
    ).all(`%${query}%`);
  },

  addMember(roomId, userId) {
    try {
      getDb().prepare(
        `INSERT OR IGNORE INTO room_members (room_id, user_id, joined_at) VALUES (?, ?, ?)`
      ).run(roomId, userId, Date.now());
    } catch (_) {}
  },

  removeMember(roomId, userId) {
    getDb().prepare(
      `DELETE FROM room_members WHERE room_id = ? AND user_id = ?`
    ).run(roomId, userId);
  },

  isMember(roomId, userId) {
    return !!getDb().prepare(
      `SELECT 1 FROM room_members WHERE room_id = ? AND user_id = ?`
    ).get(roomId, userId);
  },

  getMembers(roomId) {
    return getDb().prepare(
      `SELECT u.id, u.username, u.avatar, u.status
       FROM users u
       JOIN room_members rm ON u.id = rm.user_id
       WHERE rm.room_id = ?`
    ).all(roomId);
  }
};

module.exports = Room;