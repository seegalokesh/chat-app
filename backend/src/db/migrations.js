const { getDb } = require('../config/database');

/**
 * Simple migration runner.
 * Each migration has a unique integer id and a SQL string.
 * Already-applied migrations are skipped automatically.
 */

const migrations = [
  {
    id: 1,
    description: 'Initial schema — tables created by schema.js, this just seeds defaults',
    up: `
      -- Seed a default "general" room owned by a system placeholder
      -- Real rooms are created by users; this is a no-op if already exists
      SELECT 1;
    `
  },
  {
    id: 2,
    description: 'Add bio column to users',
    up: `
      ALTER TABLE users ADD COLUMN bio TEXT DEFAULT '';
    `
  },
  {
    id: 3,
    description: 'Add pinned_message_id to rooms',
    up: `
      ALTER TABLE rooms ADD COLUMN pinned_message_id TEXT REFERENCES messages(id);
    `
  },
  {
    id: 4,
    description: 'Add reply_to_id on messages for thread support',
    up: `
      ALTER TABLE messages ADD COLUMN reply_to_id TEXT REFERENCES messages(id);
    `
  },
  {
    id: 5,
    description: 'Add reactions table',
    up: `
      CREATE TABLE IF NOT EXISTS reactions (
        id         TEXT PRIMARY KEY,
        message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        user_id    TEXT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
        emoji      TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        UNIQUE(message_id, user_id, emoji)
      );
      CREATE INDEX IF NOT EXISTS idx_reactions_message ON reactions(message_id);
    `
  }
];

function ensureMigrationsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id          INTEGER PRIMARY KEY,
      description TEXT,
      applied_at  INTEGER NOT NULL
    )
  `);
}

function getAppliedIds(db) {
  return new Set(
    db.prepare('SELECT id FROM _migrations').all().map(r => r.id)
  );
}

function runMigrations() {
  const db = getDb();
  ensureMigrationsTable(db);
  const applied = getAppliedIds(db);

  const pending = migrations.filter(m => !applied.has(m.id));
  if (pending.length === 0) {
    console.log('[migrations] No pending migrations');
    return;
  }

  const runAll = db.transaction(() => {
    for (const migration of pending) {
      console.log(`[migrations] Applying #${migration.id}: ${migration.description}`);
      try {
        db.exec(migration.up);
        db.prepare(
          'INSERT INTO _migrations (id, description, applied_at) VALUES (?, ?, ?)'
        ).run(migration.id, migration.description, Date.now());
        console.log(`[migrations] ✓ #${migration.id} applied`);
      } catch (err) {
        // SQLite ALTER TABLE throws if column already exists — skip gracefully
        if (err.message.includes('duplicate column name') || err.message.includes('already exists')) {
          console.warn(`[migrations] ⚠ #${migration.id} skipped (already applied at DB level)`);
          db.prepare(
            'INSERT OR IGNORE INTO _migrations (id, description, applied_at) VALUES (?, ?, ?)'
          ).run(migration.id, migration.description, Date.now());
        } else {
          throw err;
        }
      }
    }
  });

  runAll();
  console.log(`[migrations] Done — ${pending.length} migration(s) applied`);
}

module.exports = { runMigrations };