// All table definitions in one place
const schema = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    username    TEXT UNIQUE NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    avatar      TEXT,
    status      TEXT DEFAULT 'offline',
    last_seen   INTEGER,
    created_at  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id          TEXT PRIMARY KEY,
    name        TEXT UNIQUE NOT NULL,
    description TEXT,
    created_by  TEXT NOT NULL,
    created_at  INTEGER NOT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS room_members (
    room_id     TEXT NOT NULL,
    user_id     TEXT NOT NULL,
    joined_at   INTEGER NOT NULL,
    PRIMARY KEY (room_id, user_id),
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id          TEXT PRIMARY KEY,
    created_at  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS conv_participants (
    conv_id     TEXT NOT NULL,
    user_id     TEXT NOT NULL,
    PRIMARY KEY (conv_id, user_id),
    FOREIGN KEY (conv_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS messages (
    id          TEXT PRIMARY KEY,
    content     TEXT NOT NULL,
    sender_id   TEXT NOT NULL,
    room_id     TEXT,
    conv_id     TEXT,
    is_edited   INTEGER DEFAULT 0,
    is_deleted  INTEGER DEFAULT 0,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id)   REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (conv_id)   REFERENCES conversations(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS read_receipts (
    message_id  TEXT NOT NULL,
    user_id     TEXT NOT NULL,
    read_at     INTEGER NOT NULL,
    PRIMARY KEY (message_id, user_id),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL,
    type        TEXT NOT NULL,
    content     TEXT NOT NULL,
    is_read     INTEGER DEFAULT 0,
    ref_id      TEXT,
    created_at  INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_messages_room    ON messages(room_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_messages_conv    ON messages(conv_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_messages_sender  ON messages(sender_id);
  CREATE INDEX IF NOT EXISTS idx_notifs_user      ON notifications(user_id, is_read);
`;

module.exports = schema;