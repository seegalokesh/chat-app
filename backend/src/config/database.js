const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const schema = require('../db/schema');

let db = null;

function getDb() {
  if (db) return db;

  const dbPath = process.env.NODE_ENV === 'production'
    ? path.join('/tmp', 'chat.db')
    : path.resolve('./chat.db');

  const dir = path.dirname(dbPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = -64000');
  db.pragma('temp_store = MEMORY');

  db.exec(schema);

  console.log(`[db] Connected to SQLite at ${dbPath}`);
  return db;
}

module.exports = { getDb };
