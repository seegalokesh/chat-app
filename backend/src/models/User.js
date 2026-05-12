const { getDb } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const User = {
  create({ username, email, password }) {
    const db = getDb();
    const id = uuidv4();
    const hashed = bcrypt.hashSync(password, 12);
    const now = Date.now();
    db.prepare(`
      INSERT INTO users (id, username, email, password, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, username, email, hashed, now);
    return this.findById(id);
  },

  findById(id) {
    return getDb().prepare(
      `SELECT id, username, email, avatar, status, last_seen, created_at
       FROM users WHERE id = ?`
    ).get(id);
  },

  findByEmail(email) {
    return getDb().prepare(`SELECT * FROM users WHERE email = ?`).get(email);
  },

  findByUsername(username) {
    return getDb().prepare(`SELECT * FROM users WHERE username = ?`).get(username);
  },

  search(query) {
    return getDb().prepare(
      `SELECT id, username, email, avatar, status
       FROM users WHERE username LIKE ? LIMIT 20`
    ).all(`%${query}%`);
  },

  updateStatus(id, status) {
    getDb().prepare(
      `UPDATE users SET status = ?, last_seen = ? WHERE id = ?`
    ).run(status, Date.now(), id);
  },

  updateAvatar(id, avatar) {
    getDb().prepare(`UPDATE users SET avatar = ? WHERE id = ?`).run(avatar, id);
  },

  getOnlineUsers() {
    return getDb().prepare(
      `SELECT id, username, avatar, status FROM users WHERE status = 'online'`
    ).all();
  },

  comparePassword(plain, hashed) {
    return bcrypt.compareSync(plain, hashed);
  }
};

module.exports = User;