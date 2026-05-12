# 📊 Database Schema & Design

Comprehensive guide to the SQLite database schema, design decisions, migration system, and optimization strategies.

## Table of Contents
- [Schema Overview](#schema-overview)
- [Table Definitions](#table-definitions)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Migrations](#migrations)
- [Performance Optimization](#performance-optimization)
- [Common Queries](#common-queries)
- [Scalability Considerations](#scalability-considerations)

---

## Schema Overview

The chat application uses a **normalized SQLite schema** optimized for real-time messaging, efficient queries, and data consistency.

```
┌─────────────────────────────────────────────────────────┐
│                       users                              │
│  (Authentication, profiles, presence)                   │
└─────────────────────────────────────────────────────────┘
           │                          │
           ├──→ room_members ←────────┼──→ rooms
           │                          │
           ├──→ conv_participants ←───┼──→ conversations
           │
           ├──→ messages (sender_id)
           │
           ├──→ read_receipts
           │
           ├──→ notifications
           │
           └──→ reactions

┌─────────────────────────────────────────────────────────┐
│                      messages                            │
│  (Content, polymorphic: room OR conversation)           │
└─────────────────────────────────────────────────────────┘
     ↓              ↓
  room_id      conv_id
     ↓              ↓
  rooms        conversations
```

---

## Table Definitions

### 1. `users`

```sql
CREATE TABLE users (
  id          TEXT PRIMARY KEY,                -- UUID (v4)
  username    TEXT UNIQUE NOT NULL,             -- User handle, 3-20 chars
  email       TEXT UNIQUE NOT NULL,             -- User email
  password    TEXT NOT NULL,                    -- Hashed with bcrypt ($2a$12$)
  avatar      TEXT,                             -- URL to avatar image
  status      TEXT DEFAULT 'offline',           -- 'online', 'offline', 'away'
  last_seen   INTEGER,                          -- UNIX timestamp (ms)
  bio         TEXT DEFAULT '',                  -- User bio/description
  created_at  INTEGER NOT NULL                  -- UNIX timestamp (ms)
);

CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

**Purpose**: User authentication, profiles, and presence tracking
**Typical Record Size**: ~200 bytes
**Example Growth**: 10K users = ~2 MB

---

### 2. `rooms`

```sql
CREATE TABLE rooms (
  id          TEXT PRIMARY KEY,                 -- UUID (v4)
  name        TEXT UNIQUE NOT NULL,             -- Room name (e.g., "general")
  description TEXT,                             -- Room description
  created_by  TEXT NOT NULL,                    -- FK → users.id
  created_at  INTEGER NOT NULL,                 -- UNIX timestamp (ms)
  pinned_message_id TEXT REFERENCES messages(id), -- Optional pinned message
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_rooms_name ON rooms(name);
```

**Purpose**: Public chat room metadata
**Typical Record Size**: ~150 bytes per room
**Example Growth**: 100 rooms = ~15 KB

---

### 3. `room_members`

```sql
CREATE TABLE room_members (
  room_id     TEXT NOT NULL,                    -- FK → rooms.id
  user_id     TEXT NOT NULL,                    -- FK → users.id
  joined_at   INTEGER NOT NULL,                 -- UNIX timestamp (ms)
  PRIMARY KEY (room_id, user_id),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_room_members_user ON room_members(user_id);
```

**Purpose**: Track room membership (many-to-many)
**Query Pattern**: "Get all members of room X", "Get all rooms user X joined"
**Typical Size**: ~16 bytes per record

---

### 4. `conversations`

```sql
CREATE TABLE conversations (
  id          TEXT PRIMARY KEY,                 -- UUID (v4)
  created_at  INTEGER NOT NULL                  -- UNIX timestamp (ms)
);
```

**Purpose**: DM thread container (minimal metadata)
**Design Note**: Actual participants stored in `conv_participants`
**Typical Record Size**: ~16 bytes

---

### 5. `conv_participants`

```sql
CREATE TABLE conv_participants (
  conv_id     TEXT NOT NULL,                    -- FK → conversations.id
  user_id     TEXT NOT NULL,                    -- FK → users.id
  PRIMARY KEY (conv_id, user_id),
  FOREIGN KEY (conv_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_conv_participants_user ON conv_participants(user_id);
```

**Purpose**: Track DM participants (always 2 users for 1-on-1 DMs)
**Typical Record Size**: ~32 bytes per pair

---

### 6. `messages`

```sql
CREATE TABLE messages (
  id          TEXT PRIMARY KEY,                 -- UUID (v4)
  content     TEXT NOT NULL,                    -- Message text (markdown)
  sender_id   TEXT NOT NULL,                    -- FK → users.id
  room_id     TEXT,                             -- FK → rooms.id (nullable)
  conv_id     TEXT,                             -- FK → conversations.id (nullable)
  is_edited   INTEGER DEFAULT 0,                -- 0 or 1 (boolean)
  is_deleted  INTEGER DEFAULT 0,                -- 0 or 1 (boolean)
  created_at  INTEGER NOT NULL,                 -- UNIX timestamp (ms)
  updated_at  INTEGER NOT NULL,                 -- UNIX timestamp (ms)
  reply_to_id TEXT REFERENCES messages(id),    -- Optional reply/thread support
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (conv_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CHECK ((room_id IS NOT NULL AND conv_id IS NULL) OR
         (room_id IS NULL AND conv_id IS NOT NULL))
);

CREATE INDEX idx_messages_room ON messages(room_id, created_at);
CREATE INDEX idx_messages_conv ON messages(conv_id, created_at);
CREATE INDEX idx_messages_sender ON messages(sender_id);
```

**Purpose**: Store all messages (polymorphic: either in a room or conversation)
**Typical Record Size**: ~300-500 bytes (varies by message length)
**Example Growth**: 100K messages = 30-50 MB
**Constraint**: Each message belongs to either a room OR a conversation, not both
**Performance**: Indexed on (room_id, created_at) and (conv_id, created_at) for pagination

---

### 7. `read_receipts`

```sql
CREATE TABLE read_receipts (
  message_id  TEXT NOT NULL,                    -- FK → messages.id
  user_id     TEXT NOT NULL,                    -- FK → users.id
  read_at     INTEGER NOT NULL,                 -- UNIX timestamp (ms)
  PRIMARY KEY (message_id, user_id),
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Purpose**: Track when users read messages in private conversations
**Typical Record Size**: ~32 bytes per read receipt
**Example**: In a DM thread with 500 messages between 2 users, ~1000 read receipts
**Query Pattern**: Get read receipts for a message to show "Seen by X" badges

---

### 8. `notifications`

```sql
CREATE TABLE notifications (
  id          TEXT PRIMARY KEY,                 -- UUID (v4)
  user_id     TEXT NOT NULL,                    -- FK → users.id (recipient)
  type        TEXT NOT NULL,                    -- 'mention', 'dm', 'room_invite'
  content     TEXT NOT NULL,                    -- Notification message
  is_read     INTEGER DEFAULT 0,                -- 0 or 1 (boolean)
  ref_id      TEXT,                             -- Reference (message_id, room_id, etc.)
  created_at  INTEGER NOT NULL,                 -- UNIX timestamp (ms)
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
```

**Purpose**: System notifications (@mentions, new DMs, room invites)
**Query Pattern**: "Get unread notifications for user X"
**Typical Record Size**: ~150 bytes

---

### 9. `reactions`

```sql
CREATE TABLE reactions (
  id          TEXT PRIMARY KEY,                 -- UUID (v4)
  message_id  TEXT NOT NULL,                    -- FK → messages.id
  user_id     TEXT NOT NULL,                    -- FK → users.id
  emoji       TEXT NOT NULL,                    -- '👍', '❤️', etc.
  created_at  INTEGER NOT NULL,                 -- UNIX timestamp (ms)
  UNIQUE(message_id, user_id, emoji),
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_reactions_message ON reactions(message_id);
```

**Purpose**: Emoji reactions on messages
**Constraint**: Each user can add each emoji once per message
**Typical Record Size**: ~64 bytes

---

## Relationships

### Polymorphic Messages

Messages use **polymorphic relationships** — each message belongs to **either** a room or a conversation:

```sql
-- Room message
INSERT INTO messages (id, content, sender_id, room_id, conv_id, ...)
VALUES (uuid, 'Hello room', user1_id, room1_id, NULL, ...);

-- DM message
INSERT INTO messages (id, content, sender_id, room_id, conv_id, ...)
VALUES (uuid, 'Hello there', user1_id, NULL, conv1_id, ...);
```

**Advantages**:
- Single messages table (easier queries)
- Supports both room and DM messages uniformly
- Efficient polymorphic queries

**Disadvantage**:
- Requires CHECK constraint to enforce exclusivity
- Queries must specify room OR conv

### User to Rooms (Many-to-Many)

```
users (1) ──→ (∞) room_members (∞) ←── (1) rooms
```

**Example Query**:
```sql
-- Get all rooms user joined
SELECT r.* FROM rooms r
JOIN room_members rm ON r.id = rm.room_id
WHERE rm.user_id = ?;

-- Get all members of room
SELECT u.* FROM users u
JOIN room_members rm ON u.id = rm.user_id
WHERE rm.room_id = ?;
```

### User to Conversations (Many-to-Many)

```
users (1) ──→ (∞) conv_participants (∞) ←── (1) conversations
```

**Example Query**:
```sql
-- Get all DM threads for user
SELECT c.*, u.* FROM conversations c
JOIN conv_participants cp1 ON c.id = cp1.conv_id
JOIN conv_participants cp2 ON c.id = cp2.conv_id
JOIN users u ON cp2.user_id = u.id
WHERE cp1.user_id = ? AND cp2.user_id != ?;
```

---

## Indexes

### Index Strategy

```sql
-- 1. PRIMARY KEY indexes (automatic)
-- users(id), rooms(id), conversations(id), messages(id), etc.

-- 2. UNIQUE constraints (automatic indexes)
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_rooms_name ON rooms(name);

-- 3. Foreign key optimizations
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_room ON messages(room_id, created_at);  -- Composite!
CREATE INDEX idx_messages_conv ON messages(conv_id, created_at);  -- Composite!
CREATE INDEX idx_room_members_user ON room_members(user_id);
CREATE INDEX idx_conv_participants_user ON conv_participants(user_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);  -- Composite!
CREATE INDEX idx_reactions_message ON reactions(message_id);
```

### Composite Index Strategy

**`messages(room_id, created_at)`**:
- Efficiently finds all messages in a room
- Sorted by creation time (descending pagination)
- Query: `SELECT * FROM messages WHERE room_id = ? ORDER BY created_at DESC LIMIT 50`

**`notifications(user_id, is_read)`**:
- Efficiently finds unread notifications for a user
- Query: `SELECT * FROM notifications WHERE user_id = ? AND is_read = 0`

---

## Migrations

### Migration System

Migrations are tracked in the `_migrations` table:

```sql
CREATE TABLE _migrations (
  id          INTEGER PRIMARY KEY,
  description TEXT,
  run_at      INTEGER
);
```

### Migration Runner

Location: `backend/src/db/migrations.js`

```javascript
const migrations = [
  {
    id: 1,
    description: 'Initial schema',
    up: `CREATE TABLE IF NOT EXISTS users (...)`
  },
  {
    id: 2,
    description: 'Add bio to users',
    up: `ALTER TABLE users ADD COLUMN bio TEXT DEFAULT '';`
  },
  {
    id: 3,
    description: 'Add reactions table',
    up: `CREATE TABLE IF NOT EXISTS reactions (...)`
  }
];

function runMigrations() {
  const db = getDb();
  const applied = db.prepare(`SELECT id FROM _migrations`).all();
  const appliedIds = applied.map(r => r.id);
  
  for (const migration of migrations) {
    if (!appliedIds.includes(migration.id)) {
      db.exec(migration.up);
      db.prepare(`INSERT INTO _migrations VALUES (?, ?, ?)`).run(
        migration.id, migration.description, Date.now()
      );
      console.log(`[migration] ${migration.id}: ${migration.description}`);
    }
  }
}
```

### Adding a New Migration

```javascript
// In migrations.js, add to `migrations` array:
{
  id: 6,
  description: 'Add pinned messages to rooms',
  up: `ALTER TABLE rooms ADD COLUMN pinned_message_id TEXT REFERENCES messages(id);`
}
```

---

## Performance Optimization

### Query Optimization Patterns

#### 1. Pagination (Most Important for Chat)

```javascript
// Load initial messages (latest 50)
const messages = db.prepare(`
  SELECT * FROM messages
  WHERE room_id = ?
  ORDER BY created_at DESC
  LIMIT 50
`).all(roomId);

// Load older messages (before timestamp)
const older = db.prepare(`
  SELECT * FROM messages
  WHERE room_id = ? AND created_at < ?
  ORDER BY created_at DESC
  LIMIT 50
`).all(roomId, beforeTimestamp);
```

#### 2. Efficient Room Member Queries

```javascript
// Get count + list
const room = db.prepare(`
  SELECT r.*,
         COUNT(rm.user_id) as member_count
  FROM rooms r
  LEFT JOIN room_members rm ON r.id = rm.room_id
  WHERE r.id = ?
  GROUP BY r.id
`).get(roomId);

const members = db.prepare(`
  SELECT u.id, u.username, u.avatar, u.status
  FROM users u
  JOIN room_members rm ON u.id = rm.user_id
  WHERE rm.room_id = ?
`).all(roomId);
```

#### 3. Latest DM Threads

```javascript
// Get user's DMs with latest message preview
const conversations = db.prepare(`
  SELECT c.*,
         u.id as other_user_id,
         u.username as other_username,
         u.avatar as other_avatar,
         u.status as other_status,
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
```

#### 4. Online Users

```javascript
const onlineUsers = db.prepare(`
  SELECT id, username, avatar, status
  FROM users
  WHERE status = 'online'
`).all();
```

### Pragmas for Performance

```javascript
// In database.js:
db.pragma('journal_mode = WAL');        // Write-Ahead Logging (better concurrency)
db.pragma('foreign_keys = ON');         // Enforce referential integrity
db.pragma('synchronous = NORMAL');      // Balance safety & speed
db.pragma('cache_size = -64000');       // 64 MB page cache
db.pragma('temp_store = MEMORY');       // Use memory for temp tables
```

### Benchmarks

**Query Performance** (typical):
- Get 50 room messages: **~10ms**
- Get online users: **~5ms**
- Get user's DM threads: **~15ms**
- Get room members: **~8ms**

**Database Size**:
- 10,000 users: ~2 MB
- 100,000 messages: ~30-50 MB
- 1,000 rooms: ~150 KB

---

## Common Queries

### Authentication

```javascript
// Find user by email
User.findByEmail(email)

// Find user by username
User.findByUsername(username)

// Update status
User.updateStatus(userId, 'online')
```

### Rooms

```javascript
// Get all rooms with member count
Room.findAll()

// Get room members
Room.getMembers(roomId)

// Check membership
Room.isMember(roomId, userId)

// Add/remove member
Room.addMember(roomId, userId)
Room.removeMember(roomId, userId)
```

### Messages

```javascript
// Get messages by room (paginated)
Message.getByRoom(roomId, limit, beforeTimestamp)

// Get messages by conversation
Message.getByConversation(convId, limit, beforeTimestamp)

// Mark as read
Message.markRead(messageId, userId)

// Get read receipts
Message.getReadReceipts(messageId)
```

### Conversations

```javascript
// Find or create DM
Conversation.findOrCreate(userId1, userId2)

// Get user's conversations
Conversation.getUserConversations(userId)

// Check participant
Conversation.isParticipant(convId, userId)
```

---

## Scalability Considerations

### Current Limits (SQLite)

- **Max database size**: ~140 TB (SQLite limit)
- **Max connections**: ~1 (SQLite is single-writer, multi-reader)
- **Max records**: Billions (practical: 10-100M per table)

### For Production Scale

If you anticipate:
- **> 100K concurrent users**: Consider PostgreSQL or MySQL
- **> 10M messages**: Add message archival/sharding strategy
- **> 100K requests/sec**: Add Redis caching layer

### Migration Path (SQLite → PostgreSQL)

```bash
# If needed, tools exist to migrate SQLite to PostgreSQL:
1. Use `pgloader` or similar tool
2. Update database connection in config/database.js
3. Update SQL syntax (minor changes needed)
4. Redeploy
```

### Caching Strategy

```javascript
// Add Redis (optional)
const redis = require('redis');
const client = redis.createClient();

// Cache room members
async function getMembers(roomId) {
  const cached = await client.get(`room:${roomId}:members`);
  if (cached) return JSON.parse(cached);
  
  const members = Room.getMembers(roomId);
  await client.setex(`room:${roomId}:members`, 3600, JSON.stringify(members));
  return members;
}

// Invalidate on member changes
Room.addMember = (roomId, userId) => {
  // ... db operation ...
  client.del(`room:${roomId}:members`);  // Cache bust
}
```

---

## Testing

### Test Database

```javascript
// Create in-memory test database
const testDb = new Database(':memory:');
testDb.exec(schema);  // Load schema

// Use in tests
beforeEach(() => {
  testDb.exec('DELETE FROM users;');
  testDb.exec('DELETE FROM rooms;');
  testDb.exec('DELETE FROM messages;');
});
```

### Sample Test Data

```javascript
// Seed test data
const testUser = User.create({
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
});

const testRoom = Room.create({
  name: 'test-room',
  description: 'Test Room',
  createdBy: testUser.id
});

const testMessage = Message.create({
  content: 'Hello world',
  senderId: testUser.id,
  roomId: testRoom.id
});
```

---

**Database design by [Your Name] | Last Updated: 2025**
