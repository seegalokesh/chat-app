# MERN Chat App (SQLite)

Real-time chat with rooms, private messaging, typing indicators, and read receipts.

## Stack
- Frontend: React 18 + Vite + Context API + Socket.io-client
- Backend: Node.js + Express + Socket.io
- Database: SQLite via better-sqlite3

## Quick start

### Backend
```bash
cd backend
npm install
cp .env.example .env     # Set JWT_SECRET
npm run dev              # Starts on :5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev              # Starts on :3000
```

The SQLite database is created automatically on first run at the path set in `DB_PATH`.

## Schema overview
- **users** — auth + presence
- **rooms** + **room_members** — public group chats
- **conversations** + **conv_participants** — private DMs (many-to-many)
- **messages** — polymorphic: linked to either `room_id` or `conv_id`
- **read_receipts** — per-message per-user read tracking
- **notifications** — @mentions and system events

## Deployment
- Frontend → Vercel (`npm run build`, set `VITE_API_URL`)
- Backend → Render (set all env vars, `DB_PATH=/data/chat.db` for persistent disk)