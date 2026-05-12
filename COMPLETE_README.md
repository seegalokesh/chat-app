# 📱 Real-Time Chat Application

A production-ready, real-time chat application built with **React**, **Node.js**, **Express**, **Socket.io**, and **SQLite**. Features include multiple public chat rooms, private direct messaging, typing indicators, read receipts, message editing/deletion, and @mentions.

## 🌟 Features

### Core Functionality
- ✅ **User Authentication** — Registration, login, logout with JWT
- ✅ **Public Chat Rooms** — Create, join, and participate in group conversations
- ✅ **Direct Messaging** — Private one-to-one conversations
- ✅ **Real-time Messaging** — Instant message delivery via Socket.io
- ✅ **Typing Indicators** — See when others are typing
- ✅ **Read Receipts** — Private message read tracking
- ✅ **Message Editing & Deletion** — Edit or delete your messages
- ✅ **@Mentions** — Tag users with notifications
- ✅ **Online Status** — Real-time user presence updates
- ✅ **Markdown Support** — Format messages with markdown + GitHub Flavored Markdown
- ✅ **User Search** — Find and message other users
- ✅ **Room Search** — Discover and join public rooms

### Technical Highlights
- 🔒 **Secure** — JWT authentication, password hashing with bcrypt, CORS protection
- ⚡ **Performant** — SQLite with proper indexes, optimized queries, pagination
- 🎨 **Responsive UI** — Custom-built components (no heavy UI libraries), mobile-friendly
- 🏗️ **Scalable Architecture** — Socket.io namespaces, separation of concerns, modular design
- 🧪 **Tested** — Unit tests for auth, database interactions, and API endpoints
- 🐳 **Containerized** — Docker & Docker Compose for easy local and production deployment
- 📊 **Observability** — Morgan logging, error handling, debugging support

## 🏗️ Architecture

### Database Schema (SQLite)
```
users
├── id, username, email, password (hashed)
├── avatar, status (online/offline), last_seen
├── bio, created_at
└── Indexes: UNIQUE(username), UNIQUE(email)

rooms (public chat channels)
├── id, name (UNIQUE), description
├── created_by (FK → users), created_at
└── Indexes: name

room_members (join table)
├── room_id (FK), user_id (FK)
├── joined_at
└── PK: (room_id, user_id)

conversations (DM threads)
├── id, created_at

conv_participants (DM join table)
├── conv_id (FK), user_id (FK)
└── PK: (conv_id, user_id)

messages
├── id, content, sender_id (FK → users)
├── room_id (FK, nullable) or conv_id (FK, nullable)
├── is_edited, is_deleted, created_at, updated_at
├── reply_to_id (FK, nullable, for threading)
└── Indexes: (room_id, created_at), (conv_id, created_at), sender_id

read_receipts (private message read tracking)
├── message_id (FK → messages)
├── user_id (FK → users), read_at
└── PK: (message_id, user_id)

notifications (@mentions and system events)
├── id, user_id (FK), type, content, is_read
├── ref_id (reference to message/room/etc.), created_at
└── Indexes: (user_id, is_read)

reactions (emoji reactions on messages)
├── id, message_id (FK), user_id (FK)
├── emoji, created_at
└── UNIQUE: (message_id, user_id, emoji)
```

### Backend Architecture (Node.js/Express)

```
backend/src/
├── server.js                 # Express app setup, middleware, error handling
├── config/
│   └── database.js          # SQLite connection pool, pragmas, schema exec
├── db/
│   ├── schema.js            # SQL table definitions
│   └── migrations.js        # Migration runner and history
├── models/
│   ├── User.js              # CRUD for users, password hashing, auth
│   ├── Room.js              # Room management, membership, queries
│   ├── Conversation.js      # DM conversation lifecycle
│   └── Message.js           # Message CRUD, read receipts, queries
├── routes/
│   ├── auth.js              # /api/auth — register, login, /me
│   ├── rooms.js             # /api/rooms — CRUD, join/leave, messages
│   ├── conversations.js     # /api/conversations — DM threads
│   ├── messages.js          # /api/messages — message retrieval
│   └── users.js             # /api/users — search, online list
├── middleware/
│   ├── auth.js              # JWT verification (REST + Socket.io)
│   └── validate.js          # express-validator integration
└── socket/
    ├── index.js             # Socket.io setup, namespaces
    └── handlers/
        ├── messageHandler.js   # message:send, :edit, :delete, :read
        ├── roomHandler.js      # room:join, :leave, conv:join
        ├── presenceHandler.js  # online/offline status
        └── typingHandler.js    # typing:start, :stop
```

### Frontend Architecture (React/Vite)

```
frontend/src/
├── main.jsx                      # Vite entry point
├── App.jsx                       # Router setup, protected routes
├── components/
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── chat/
│   │   ├── ChatWindow.jsx        # Main chat layout
│   │   ├── MessageList.jsx       # Scrollable message feed
│   │   ├── MessageItem.jsx       # Single message with markdown, edit/delete
│   │   ├── MessageInput.jsx      # Textarea with typing indicator
│   │   └── TypingIndicator.jsx   # "User is typing…"
│   ├── layout/
│   │   ├── Header.jsx            # Chat title, user menu, connection status
│   │   └── Sidebar.jsx           # Room/DM list, search, create room
│   ├── rooms/
│   │   ├── CreateRoom.jsx        # Modal for new room creation
│   │   └── RoomList.jsx          # List of joined rooms
│   ├── ui/
│   │   ├── Modal.jsx             # Generic modal wrapper
│   │   ├── Avatar.jsx            # User avatar with fallback initials
│   │   └── Badge.jsx             # Status badge component
│   └── users/
│       ├── UserList.jsx          # Room members sidebar
│       └── UserItem.jsx          # Single user with status
├── contexts/
│   ├── AuthContext.jsx           # Login state, JWT management
│   ├── SocketContext.jsx         # Socket.io instance
│   ├── ChatContext.jsx           # Rooms, messages, typing, presence
│   └── UIContext.jsx             # Modals, notifications
├── hooks/
│   ├── useChat.js                # Convenience hook for ChatContext
│   └── useSocket.js              # Convenience hook for SocketContext
├── utils/
│   ├── api.js                    # Axios instance with JWT interceptor
│   └── markdown.jsx              # Markdown components, @mention processing
└── styles/
    ├── global.css                # Base layout, colors, typography
    └── variables.css             # CSS custom properties
```

### API Endpoints

#### Authentication
```
POST   /api/auth/register          # { username, email, password } → { user, token }
POST   /api/auth/login             # { email, password } → { user, token }
GET    /api/auth/me                # Get current user (protected)
```

#### Rooms
```
GET    /api/rooms                  # List all public rooms
GET    /api/rooms/search           # Search rooms by name
GET    /api/rooms/:id              # Get room + members
POST   /api/rooms                  # Create new room (protected)
POST   /api/rooms/:id/join         # Join room (protected)
POST   /api/rooms/:id/leave        # Leave room (protected)
GET    /api/rooms/:id/messages     # Get message history (protected)
```

#### Conversations (Direct Messages)
```
GET    /api/conversations          # List user's DM threads (protected)
POST   /api/conversations/:userId  # Start/get DM with user (protected)
GET    /api/conversations/:id/messages  # Get DM history (protected)
```

#### Users
```
GET    /api/users                  # List online users or search (protected)
GET    /api/users/:id              # Get user profile (protected)
```

### Socket.io Events

#### Message Events
```
Client → Server:
  message:send  { roomId?, convId?, content }
  message:edit  { messageId, content }
  message:delete { messageId, roomId?, convId? }
  message:read  { messageId, convId }

Server → Client:
  message:new  { message object }
  message:edited { updated message }
  message:deleted { messageId, roomId?, convId? }
  message:read_receipt { messageId, receipts[] }
```

#### Room Events
```
Client → Server:
  room:join { roomId }
  room:leave { roomId }
  conv:join { convId }

Server → Client:
  room:joined { room, members }
  room:user_joined { roomId, user }
  room:user_left { roomId, userId }
```

#### Presence Events
```
Server → Client:
  presence:online { userId }
  presence:offline { userId }
```

#### Typing Events
```
Client → Server:
  typing:start { roomId?, convId? }
  typing:stop { roomId?, convId? }

Server → Client:
  typing:start { userId, username, roomId?, convId? }
  typing:stop { userId, roomId?, convId? }
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- (Optional) Docker & Docker Compose for containerized setup

### Local Development

#### 1. Clone & Install

```bash
cd chat-app

# Backend
cd backend
npm install
cp .env.example .env    # Edit .env with your JWT_SECRET

# Frontend (in another terminal)
cd frontend
npm install
cp .env.example .env    # Edit .env if needed
```

#### 2. Initialize Database (Backend)

```bash
cd backend
npm run dev
```

The server will:
- Run migrations automatically
- Create `chat.db` with schema
- Start on `http://localhost:5000`

#### 3. Start Frontend

```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

#### 4. Test the Application

```bash
# Create 2 accounts
# Join public rooms
# Send direct messages
# Try editing/deleting messages
# Test offline/online status
```

### Docker Compose (All-in-One)

```bash
# From project root
docker-compose up --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
# Socket.io: ws://localhost:5000
```

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
npm test                 # All tests
npm test -- auth       # Auth tests only
npm test -- messages   # Message tests only
```

### Test Coverage

Tests cover:
- User registration & login validation
- JWT token verification
- Room creation & membership
- Message retrieval permissions
- Socket.io authentication

## 📦 Build & Deployment

### Local Build

```bash
# Backend (no build needed, runs from src/)
cd backend
npm run dev

# Frontend build
cd frontend
npm run build
npm run preview      # Serve dist/ locally
```

### Docker Build

```bash
# Build images
docker build -f Dockerfile.backend -t chat-backend:latest .
docker build -f Dockerfile.frontend -t chat-frontend:latest .

# Or with Compose
docker-compose build
```

### Environment Variables for Production

#### Backend (`.env`)
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=<generate-strong-random-string>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://yourdomain.com
DB_PATH=/data/chat.db              # Use persistent volume
```

#### Frontend (`.env`)
```env
VITE_API_URL=https://api.yourdomain.com
VITE_SOCKET_URL=https://api.yourdomain.com
```

### Deployment to Render

#### Backend (Node.js)

1. Create new **Web Service** on Render
2. Connect your GitHub repo
3. Set **Build Command**: `cd backend && npm install`
4. Set **Start Command**: `cd backend && npm start`
5. Add **Environment Variables**:
   ```
   NODE_ENV=production
   JWT_SECRET=<strong-secret>
   CLIENT_URL=https://your-frontend-domain
   DB_PATH=/data/chat.db
   ```
6. Add **Persistent Disk** at `/data` for SQLite
7. Deploy

#### Frontend (Static Site)

1. Create new **Static Site** on Render
2. Connect your GitHub repo
3. Set **Build Command**: `cd frontend && npm run build`
4. Set **Publish Directory**: `frontend/dist`
5. Add **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-render-url.onrender.com/api
   VITE_SOCKET_URL=https://your-backend-render-url.onrender.com
   ```
6. Deploy

### Deployment to Vercel (Frontend)

1. Push code to GitHub
2. Create new project on Vercel, select your repo
3. Framework: **Vite**
4. Build command: `npm run build` (from `frontend` root)
5. Output directory: `dist`
6. Add environment variables (same as above)
7. Deploy

### Production Considerations

- **Database**: Use persistent volume/disk (Render, DigitalOcean, etc.)
- **SSL/TLS**: Enable HTTPS (Render/Vercel auto-enable)
- **CORS**: Set `CLIENT_URL` to your frontend domain
- **Rate Limiting**: Already configured on `/api/auth` endpoints
- **Logging**: Morgan logs all HTTP requests
- **Backups**: Set up regular SQLite backups of your persistent disk
- **Monitoring**: Use Render/Vercel built-in logs and error tracking

## 🔒 Security Features

- ✅ JWT authentication with expiration
- ✅ Password hashing with bcrypt (salt rounds: 12)
- ✅ CORS protection
- ✅ Rate limiting on auth endpoints
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (React escaping + markdown sanitization)
- ✅ Socket.io authentication
- ✅ Authorization checks on all user-scoped endpoints
- ✅ Environment variable protection (.env not in git)

## 📚 Database Queries & Performance

### Indexed Queries (Optimized)

```sql
-- Get latest messages in a room
SELECT * FROM messages WHERE room_id = ? 
  ORDER BY created_at DESC LIMIT 50;  -- Uses idx_messages_room

-- Get room members
SELECT u.* FROM users u
JOIN room_members rm ON u.id = rm.user_id
WHERE rm.room_id = ?;  -- Uses PK on room_members

-- Get user's DM threads
SELECT c.*, u.username FROM conversations c
JOIN conv_participants cp1 ON c.id = cp1.conv_id
JOIN conv_participants cp2 ON c.id = cp2.conv_id
JOIN users u ON cp2.user_id = u.id
WHERE cp1.user_id = ? ORDER BY last_message_at DESC;
```

### Pagination Example

```javascript
// Fetch next page of messages (before timestamp)
const before = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
const messages = await api.get(`/rooms/${roomId}/messages?limit=50&before=${before}`);
```

## 🛠️ Development Tips

### Adding a Feature

1. **Update schema** in `backend/src/db/schema.js`
2. **Create migration** in `backend/src/db/migrations.js`
3. **Add model methods** in `backend/src/models/`
4. **Create API route** in `backend/src/routes/`
5. **Create Socket handler** in `backend/src/socket/handlers/`
6. **Add frontend component** in `frontend/src/components/`
7. **Update contexts** if needed in `frontend/src/contexts/`
8. **Write tests** in `backend/tests/`

### Debugging

```bash
# Enable SQL query logging (backend)
# In src/config/database.js, uncomment:
// verbose: process.env.NODE_ENV === 'development' ? console.log : null

# Socket.io debug
# In browser console:
localStorage.debug = 'socket.io-client:*'
```

### Common Issues

**Port already in use**: Kill process on port 5000/3000
```bash
# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

**Database locked**: Close all connections and delete `.db-shm`, `.db-wal`
```bash
rm chat.db-shm chat.db-wal
npm run dev
```

**Socket.io not connecting**: Check `CORS` and `CLIENT_URL` in `.env`

## 📋 Testing Checklist

- [ ] Register new user
- [ ] Login with correct credentials
- [ ] Logout
- [ ] Create a public room
- [ ] Join existing room
- [ ] Send message in room
- [ ] Edit own message
- [ ] Delete own message
- [ ] Start DM with user
- [ ] Send DM message
- [ ] Typing indicator appears
- [ ] User online/offline status updates
- [ ] Read receipts update in private chats
- [ ] @mention user
- [ ] Search for users
- [ ] Search for rooms
- [ ] Connection status indicator works

## 📝 File Structure Summary

```
chat-app/
├── .gitignore
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf
├── README.md
├── backend/
│   ├── .env.example
│   ├── package.json
│   ├── src/
│   │   ├── server.js
│   │   ├── config/database.js
│   │   ├── db/{schema,migrations}.js
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── socket/
│   └── tests/
└── frontend/
    ├── .env.example
    ├── package.json
    ├── vite.config.js
    ├── public/index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── components/
        ├── contexts/
        ├── utils/
        └── styles/
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -am 'Add my feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Open a Pull Request

## 📄 License

MIT License — see LICENSE file

## 📞 Support

For issues or questions:
1. Check existing issues/FAQs
2. Create a GitHub issue with reproduction steps
3. Include backend logs and browser console errors

---

**Built with ❤️ using React, Node.js, and SQLite**
