# 🏗️ ARCHITECTURE & TECHNICAL DESIGN

Comprehensive architectural overview of the real-time chat application.

## Table of Contents
- [System Architecture](#system-architecture)
- [Component Design](#component-design)
- [Data Flow](#data-flow)
- [Real-time Communication](#real-time-communication)
- [Security Architecture](#security-architecture)
- [Error Handling](#error-handling)
- [Scalability](#scalability)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser / Client                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React 18 + Vite                                          │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐ │  │
│  │  │ Auth        │  │ Chat         │  │ UI               │ │  │
│  │  │ Components  │  │ Components   │  │ Components       │ │  │
│  │  └─────────────┘  └──────────────┘  └──────────────────┘ │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐ │  │
│  │  │ Auth        │  │ Chat         │  │ Socket           │ │  │
│  │  │ Context     │  │ Context      │  │ Context          │ │  │
│  │  └─────────────┘  └──────────────┘  └──────────────────┘ │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │ API Client (axios) | Socket.io Client             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS + WebSocket
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                     Nginx Reverse Proxy                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ • Route /api → Backend                                   │   │
│  │ • Route /socket.io → Backend (WebSocket upgrade)         │   │
│  │ • Route /* → Frontend (SPA fallback)                     │   │
│  │ • Gzip compression                                       │   │
│  │ • Static asset caching                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────┴──────┐  ┌────────┴─────┐  ┌────────┴─────┐
│              │  │              │  │              │
│   Backend    │  │   Backend    │  │   Backend    │
│   (Port 5000)│  │  (Port 5000) │  │ (Port 5000)  │
│              │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
    (Replica 1)     (Replica 2)     (Replica 3)
        │                │                │
        └────────────────┼────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
    ┌────┴─────┐                   ┌────┴─────┐
    │ SQLite   │                   │ Redis    │
    │ Database │                   │ Cache    │
    │ (shared) │                   │ (optional)│
    └──────────┘                   └──────────┘
         ▲                               │
         │ Persistent Volume             │
    ┌────┴──────────────────────────────┘
    │
   /data (mount point)
```

### Architecture Tiers

**Presentation Tier** (Browser)
- React components for UI
- Context API for state management
- Socket.io client for real-time updates
- Axios for HTTP requests

**Application Tier** (Node.js/Express)
- RESTful API endpoints
- Socket.io server for real-time events
- JWT authentication middleware
- Request validation and error handling

**Data Tier** (SQLite)
- Relational database with normalized schema
- Persistent storage on volume
- Optimized indexes for query performance

---

## Component Design

### Backend Component Architecture

```
Express App
│
├─ Authentication Layer
│  └─ JWT Verification
│     ├─ authMiddleware (REST)
│     └─ authenticateSocket (Socket.io)
│
├─ REST API Routes
│  ├─ /api/auth
│  │  ├─ POST /register
│  │  ├─ POST /login
│  │  └─ GET /me
│  ├─ /api/rooms
│  │  ├─ GET / (list)
│  │  ├─ POST / (create)
│  │  ├─ GET /:id (get single)
│  │  ├─ POST /:id/join
│  │  ├─ POST /:id/leave
│  │  └─ GET /:id/messages
│  ├─ /api/conversations
│  │  ├─ GET / (list user's DMs)
│  │  ├─ POST /:userId (start DM)
│  │  └─ GET /:id/messages
│  └─ /api/users
│     ├─ GET / (search/online list)
│     └─ GET /:id (profile)
│
├─ Socket.io Namespaces & Rooms
│  ├─ room:${roomId} (public chat)
│  ├─ conv:${convId} (private DM)
│  └─ Global events
│     ├─ presence:online
│     ├─ presence:offline
│     ├─ mention
│     └─ typing notifications
│
├─ Event Handlers
│  ├─ messageHandler
│  │  ├─ message:send
│  │  ├─ message:edit
│  │  ├─ message:delete
│  │  └─ message:read
│  ├─ roomHandler
│  │  ├─ room:join
│  │  ├─ room:leave
│  │  └─ conv:join
│  ├─ presenceHandler
│  │  ├─ Connect → online
│  │  └─ Disconnect → offline
│  └─ typingHandler
│     ├─ typing:start
│     └─ typing:stop
│
├─ Models (Data Access Layer)
│  ├─ User (CRUD, auth)
│  ├─ Room (membership, queries)
│  ├─ Conversation (DM threads)
│  └─ Message (polymorphic, read receipts)
│
└─ Database Layer
   ├─ Config (connection, pragmas)
   ├─ Schema (table definitions)
   └─ Migrations (evolution)
```

### Frontend Component Architecture

```
React App
│
├─ Pages / Routes
│  ├─ /login (Login component)
│  ├─ /register (Register component)
│  └─ / (Chat App)
│     ├─ Layout
│     │  ├─ Header
│     │  └─ Sidebar
│     ├─ Main Chat Area
│     │  ├─ MessageList
│     │  ├─ MessageInput
│     │  └─ ChatWindow
│     └─ Right Panel (Members)
│        └─ UserList
│
├─ Context Providers (State Management)
│  ├─ AuthContext
│  │  ├─ user (current user)
│  │  ├─ login()
│  │  ├─ register()
│  │  └─ logout()
│  ├─ SocketContext
│  │  ├─ socket (Socket.io instance)
│  │  └─ connected (boolean)
│  ├─ ChatContext
│  │  ├─ rooms[]
│  │  ├─ conversations[]
│  │  ├─ messages{} (by room/conv)
│  │  ├─ activeChat
│  │  ├─ typingUsers{}
│  │  ├─ onlineUsers{}
│  │  ├─ sendMessage()
│  │  └─ sendTyping()
│  └─ UIContext
│     ├─ modal (null | 'createRoom')
│     ├─ notifications[]
│     ├─ openModal()
│     ├─ closeModal()
│     └─ addNotification()
│
├─ Components
│  ├─ Auth Components
│  │  ├─ Login
│  │  └─ Register
│  ├─ Chat Components
│  │  ├─ ChatWindow
│  │  ├─ MessageList
│  │  ├─ MessageItem (with edit/delete)
│  │  ├─ MessageInput
│  │  └─ TypingIndicator
│  ├─ Layout Components
│  │  ├─ Header
│  │  └─ Sidebar (with search)
│  ├─ Room Components
│  │  ├─ CreateRoom (modal)
│  │  └─ RoomList
│  ├─ User Components
│  │  ├─ UserList
│  │  └─ UserItem
│  └─ UI Components
│     ├─ Modal
│     ├─ Avatar
│     └─ Badge
│
├─ Hooks
│  ├─ useChat() → ChatContext
│  ├─ useSocket() → SocketContext
│  ├─ useAuth() → AuthContext
│  └─ useUI() → UIContext
│
├─ Utils
│  ├─ api.js (axios instance)
│  └─ markdown.jsx (markdown processing)
│
└─ Styles
   ├─ global.css (layout, typography)
   └─ variables.css (colors, sizes)
```

---

## Data Flow

### Message Sending Flow

```
User Types Message
    │
    ▼
MessageInput Component
    │ (handleSubmit)
    ├─ sendMessage(content) [ChatContext]
    │
    ▼
Socket.io Client
    │
    ├─ emit 'message:send' {roomId, convId, content}
    │
    ▼
Backend Socket Handler (messageHandler)
    │
    ├─ Permission Check
    │  └─ Is user member of room/participant of conv?
    │
    ├─ Process @mentions
    │  └─ Extract @usernames, create notifications
    │
    ▼
Message.create(content, senderId, roomId/convId)
    │
    ├─ Generate UUID
    ├─ Store in database
    ├─ Retrieve full message with sender info
    │
    ▼
Broadcasting via Socket.io
    │
    ├─ io.to(`room:${roomId}`).emit('message:new', message)
    │  OR
    ├─ io.to(`conv:${convId}`).emit('message:new', message)
    │
    ▼
Frontend Socket Listener
    │
    ├─ socket.on('message:new', (msg) => {...})
    │
    ├─ Update ChatContext
    │  └─ setMessages(prev => {..., [key]: [...prev[key], msg]})
    │
    ▼
React Re-render
    │
    ├─ MessageList component receives updated messages
    ├─ Auto-scroll to bottom
    └─ Display new message with timestamp + avatar

Time: ~50-150ms end-to-end
```

### User Goes Online Flow

```
User Opens Browser
    │
    ▼
React App Mounts
    │
    ├─ AuthContext verifies JWT
    ├─ SocketProvider connects Socket.io
    │
    ▼
Socket.io Connects to Backend
    │
    ├─ Authenticates with JWT
    ├─ Callback: io.on('connection', (socket) => {...})
    │
    ▼
presenceHandler Triggers
    │
    ├─ User.updateStatus(userId, 'online')
    │  └─ UPDATE users SET status = 'online', last_seen = NOW()
    │
    ▼
Broadcasting Presence
    │
    ├─ io.emit('presence:online', { userId })
    │
    ▼
All Connected Clients Receive
    │
    ├─ socket.on('presence:online', ({ userId }) => {...})
    ├─ Update ChatContext.onlineUsers[userId] = true
    ├─ React re-render
    └─ Show green dot next to user in UI

Time: ~20-50ms
```

### Message Read Receipt Flow (DMs Only)

```
User Opens DM Conversation
    │
    ▼
ChatContext loads messages
    │
    ├─ Fetches /api/conversations/:id/messages
    ├─ Displays message list
    │
    ▼
User Scrolls and Sees Messages
    │
    ├─ (In future: implement onMessageVisible intersection observer)
    │
    ▼
Socket Emit: message:read
    │
    ├─ socket.emit('message:read', { messageId, convId })
    │
    ▼
Backend Handler
    │
    ├─ Message.markRead(messageId, userId)
    │  └─ INSERT INTO read_receipts (message_id, user_id, read_at)
    │
    ├─ Query read receipts for message
    │  └─ SELECT user, read_at FROM read_receipts WHERE message_id = ?
    │
    ▼
Broadcasting Read Receipts
    │
    ├─ io.to(`conv:${convId}`).emit('message:read_receipt', {...})
    │
    ▼
Frontend Updates Message
    │
    ├─ Show "Seen by @alice at 2:45 PM"
    └─ Badge/indicator on message

Time: ~30-60ms
```

---

## Real-time Communication

### Socket.io Architecture

```
┌─────────────────────────────────────────┐
│    Socket.io Server (http.Server)       │
│                                         │
│  Namespaces & Rooms:                    │
│  ├─ default namespace /                 │
│  │  ├─ room:${roomId}  (broadcast room)│
│  │  └─ conv:${convId}  (broadcast conv)│
│  │                                      │
│  └─ Event Handlers (per socket):        │
│     ├─ message:send                     │
│     ├─ message:edit                     │
│     ├─ message:delete                   │
│     ├─ message:read                     │
│     ├─ room:join                        │
│     ├─ room:leave                       │
│     ├─ typing:start                     │
│     ├─ typing:stop                      │
│     └─ (presence auto-handled)          │
└─────────────────────────────────────────┘
```

### Broadcasting Strategy

```
Events sent TO A ROOM (e.g., room:general):
├─ message:new        (new message from any user)
├─ message:edited     (message edited)
├─ message:deleted    (message deleted)
├─ typing:start       (user started typing)
├─ typing:stop        (user stopped typing)
├─ room:user_joined   (user joined room)
└─ room:user_left     (user left room)

Global events (sent to ALL clients):
├─ presence:online    (user came online)
└─ presence:offline   (user went offline)

Private events (sent to ONE socket):
├─ error              (permission denied, etc.)
└─ room:joined        (confirmation of room join)
```

### Typing Indicator Flow

```
User Starts Typing
    │
    ▼
MessageInput.handleChange() fires
    │
    ├─ Clear debounce timer
    ├─ Set isTypingRef = true
    ├─ Emit 'typing:start' if first keystroke
    │
    ▼
Socket emits to room/conv
    │
    ├─ socket.emit('typing:start', {roomId/convId})
    │
    ▼
Backend broadcasts to others
    │
    ├─ socket.to(target).emit('typing:start', {userId, username})
    │
    ▼
Other Clients Receive
    │
    ├─ socket.on('typing:start', ({userId, username}) => {...})
    ├─ setTypingUsers(prev => {..., [key]: {..., userId: username}})
    │
    ▼
React Re-render
    │
    ├─ TypingIndicator shows "alice is typing…"
    │
    ▼ (2000ms idle timer in MessageInput)
    │
    ├─ setTypingUsers stops (no keystroke for 2s)
    ├─ Emit 'typing:stop'
    │
    ▼
TypingIndicator disappears

Total latency: ~20-50ms for indicator to appear
```

---

## Security Architecture

### Authentication Flow

```
User Registration
    │
    ├─ POST /api/auth/register {username, email, password}
    │
    ├─ Validation (express-validator)
    │  ├─ username: 3-20 alphanumeric
    │  ├─ email: valid email format
    │  └─ password: min 6 chars
    │
    ├─ Check duplicates
    │  ├─ User.findByEmail(email)
    │  └─ User.findByUsername(username)
    │
    ├─ Hash password
    │  └─ bcrypt.hashSync(password, 12) → $2a$12$...
    │
    ├─ Store in database
    │  └─ INSERT INTO users (id, username, email, password, ...)
    │
    ├─ Generate JWT
    │  └─ jwt.sign({userId}, JWT_SECRET, {expiresIn: '7d'})
    │
    └─ Response: {user, token}

User Login
    │
    ├─ POST /api/auth/login {email, password}
    │
    ├─ Find user
    │  └─ User.findByEmail(email)
    │
    ├─ Verify password
    │  └─ bcrypt.compareSync(password, storedHash)
    │
    ├─ Generate new JWT
    │  └─ jwt.sign({userId}, JWT_SECRET, {expiresIn: '7d'})
    │
    └─ Response: {user, token}

Protected API Call
    │
    ├─ Client sends: Authorization: Bearer <token>
    │
    ├─ authMiddleware verifies
    │  ├─ Extract token from Authorization header
    │  ├─ jwt.verify(token, JWT_SECRET)
    │  └─ Attach user to req.user
    │
    └─ Route executes (has req.user context)
```

### Authorization Checks

```
Room Operations:
├─ GET /rooms/:id/messages
│  └─ Check: Room.isMember(roomId, userId) OR 401
├─ POST /rooms/:id/join
│  └─ No check (public rooms)
└─ POST /rooms/:id/leave
   └─ No check (users can leave anytime)

DM Operations:
├─ GET /conversations/:id/messages
│  └─ Check: Conversation.isParticipant(convId, userId) OR 403
└─ POST /conversations/:userId
   └─ Check: targetUser !== currentUser OR 400

Message Operations:
├─ DELETE message
│  └─ Check: message.sender_id === userId OR 403
├─ EDIT message
│  └─ Check: message.sender_id === userId OR 403
└─ MARK READ
   └─ No check (users can mark their own messages as read)
```

### Security Features

```
✅ Password Security
   └─ bcrypt with 12 salt rounds

✅ JWT Authentication
   └─ 7-day expiration + signature verification

✅ CORS Protection
   └─ Only frontend domain in CLIENT_URL env var

✅ Rate Limiting
   └─ /api/auth routes: max 20 requests per 15 minutes

✅ Input Validation
   └─ express-validator on all inputs

✅ SQL Injection Prevention
   └─ Parameterized queries (prepared statements)

✅ XSS Protection
   └─ React escapes JSX, Markdown sanitization

✅ HTTPS/TLS
   └─ Enforced in production via Nginx

✅ Socket.io Authentication
   └─ JWT verified on socket handshake

✅ CSRF Protection
   └─ Credentials-based CORS + SameSite cookies
```

---

## Error Handling

### Backend Error Handling

```
Validation Errors (400)
    ├─ express-validator middleware
    └─ Response: { errors: [{msg, param}] }

Authentication Errors (401)
    ├─ Missing/invalid JWT
    ├─ User not found
    └─ Response: { error: 'Invalid or expired token' }

Authorization Errors (403)
    ├─ User not room member
    ├─ User not conversation participant
    ├─ Cannot edit/delete others' messages
    └─ Response: { error: 'Access denied' }

Not Found Errors (404)
    ├─ Room/user/message not found
    └─ Response: { error: 'Not found' }

Conflict Errors (409)
    ├─ Duplicate room name
    ├─ Duplicate email/username
    └─ Response: { error: 'Conflict' }

Server Errors (500)
    ├─ Global error handler
    ├─ Logs to console/sentry
    └─ Response: { error: 'Internal server error' }
```

### Frontend Error Handling

```
Network Errors
    ├─ Axios interceptors catch
    ├─ Show toast notification
    └─ Retry logic (optional)

Authentication Errors
    ├─ 401 responses trigger logout
    ├─ Redirect to /login
    ├─ Clear JWT from localStorage
    └─ Show error message

Socket.io Errors
    ├─ Connection failure → show disconnected badge
    ├─ Auto-reconnect with exponential backoff
    ├─ Queue messages while offline
    └─ Retry on reconnection

User-facing Errors
    ├─ Validation feedback (form errors)
    ├─ Toast notifications (success/error)
    ├─ Graceful degradation
    └─ Console warnings for debugging
```

---

## Scalability

### Horizontal Scaling Strategy

```
For Multiple Backend Instances:

Load Balancer
    │
    ├─ Backend Instance 1 (port 5000)
    ├─ Backend Instance 2 (port 5000)
    └─ Backend Instance 3 (port 5000)
         │
         └─→ Shared SQLite (single database)
         └─→ Redis for Socket.io Adapter (optional)

Challenge: SQLite is single-writer
Solution Options:
1. Use shared database with careful locking
2. Migrate to PostgreSQL
3. Use Redis adapter for Socket.io
4. Shard by room/user

Socket.io Clustering:
    ├─ Install: npm install @socket.io/redis-adapter
    ├─ Connect to Redis
    └─ Allows emits to reach all instances
```

### Caching Strategy

```
Optional Redis Cache Layer:

Hot Data (cached):
    ├─ Online users list
    ├─ Room members list
    ├─ User profiles
    └─ Popular room info

Invalidation:
    ├─ On user status change → bust cache
    ├─ On room member change → bust cache
    ├─ TTL: 1 hour default
    └─ Manual invalidation on write

Cache-aside pattern:
    1. Check Redis
    2. If miss, query SQLite
    3. Store in Redis with TTL
    4. Return to client
```

---

**Architecture Document | Last Updated: 2025**
