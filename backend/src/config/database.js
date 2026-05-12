const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const schema = require('../db/schema');

let db;

function getDb() {
  if (db) return db;

  const dbPath = path.resolve(process.env.DB_PATH || './chat.db');

  // Ensure directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(dbPath, {
    // verbose: process.env.NODE_ENV === 'development' ? console.log : null
  });

  // Performance pragmas
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = -64000');   // 64MB page cache
  db.pragma('temp_store = MEMORY');

  // Run schema (all CREATE IF NOT EXISTS — safe to re-run)
  db.exec(schema);

  console.log(`[db] Connected to SQLite at ${dbPath}`);
  return db;
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
    console.log('[db] Connection closed');
  }
}

// Graceful shutdown
process.on('exit',    closeDb);
process.on('SIGINT',  () => { closeDb(); process.exit(0); });
process.on('SIGTERM', () => { closeDb(); process.exit(0); });

module.exports = { getDb, closeDb };