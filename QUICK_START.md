# 🚀 QUICK START GUIDE

Get the chat application running in **5 minutes** on your local machine.

## Prerequisites

- **Node.js 18+** — [Download](https://nodejs.org)
- **npm** (comes with Node.js)
- **Git** (to clone the repo)

> **Windows Users**: If you get WSL2 warnings, that's normal. Just use PowerShell or cmd.

---

## Method 1: Docker Compose (Fastest ⚡)

### Step 1: Install Docker

- **Windows/Mac**: [Docker Desktop](https://www.docker.com/products/docker-desktop)
- **Linux**: `sudo apt-get install -y docker.io docker-compose`

### Step 2: Run

```bash
# From project root
docker-compose up --build

# Wait for both services to start (check logs)
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### Step 3: Test

1. Open **http://localhost:3000** in your browser
2. Register a new account
3. Create a room or start a DM
4. Send messages!

---

## Method 2: Local Development (Manual)

### Step 1: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env (optional, defaults work for local dev):
# - Change JWT_SECRET only if you want to
# - Change CLIENT_URL if frontend is not on localhost:3000

# Start backend
npm run dev

# You should see:
# ✓ [db] Connected to SQLite at ./chat.db
# ✓ Server running on port 5000
```

### Step 2: Frontend Setup (New Terminal)

```bash
cd frontend

# Install dependencies
npm install

# Create environment file (optional)
cp .env.example .env

# Start frontend
npm run dev

# You should see:
# ✓ Port 3000 is in use, trying 3001
# or
# ✓ Local:   http://localhost:3000
```

### Step 3: Open Browser

Click the link or navigate to **http://localhost:3000**

---

## First Steps in the App

### 1. Create Account

1. Click **"Create account"**
2. Enter:
   - Username: `testuser1` (or any name)
   - Email: `test1@example.com`
   - Password: `password123`
3. Click **Create account**

### 2. Create Second Account (for testing DMs)

1. Log out (button in top-right)
2. Repeat Step 1 with:
   - Username: `testuser2`
   - Email: `test2@example.com`
   - Password: `password123`

### 3. Create a Room

1. Log in with `testuser1`
2. Click **Create Room** button
3. Enter room name: `general`
4. Click **Create**

### 4. Send Messages

1. Type a message: `Hello, world! 👋`
2. Press **Send** or **Enter**
3. Try markdown: `**bold** or _italic_`

### 5. Test Direct Messages

1. Search for `testuser2` in the search box
2. Click to start DM
3. Send messages back and forth

### 6. Test Features

- ✅ **Typing indicator**: Start typing in a room/DM
- ✅ **Edit message**: Hover over your message, click ✏️
- ✅ **Delete message**: Hover over your message, click 🗑️
- ✅ **Online status**: Join from another account, see green dot
- ✅ **Search**: Search for rooms or users at the top

---

## Stopping the Application

### Docker Compose
```bash
docker-compose down

# Remove volumes (delete database)
docker-compose down -v
```

### Local Development
```bash
# In backend terminal: Ctrl+C
# In frontend terminal: Ctrl+C
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :5000     # Backend
lsof -i :3000     # Frontend

# Kill it
kill -9 <PID>
```

### "Cannot find module" error

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database Locked

```bash
cd backend
rm chat.db-shm chat.db-wal
npm run dev
```

### Socket.io connection fails

```
Check:
1. Backend is running (npm run dev in backend/)
2. Frontend shows "Connected" in top-right header
3. Check browser console for errors (F12)
```

---

## Next Steps

- Read [COMPLETE_README.md](./COMPLETE_README.md) for full feature list
- Read [DATABASE.md](./DATABASE.md) to understand the database schema
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to production
- Read [ARCHITECTURE.md](./ARCHITECTURE.md) for technical deep-dive

---

## Quick Reference

### Backend Commands
```bash
npm run dev      # Start dev server (with hot reload)
npm start        # Start production server
npm test         # Run tests
```

### Frontend Commands
```bash
npm run dev      # Start dev server on port 3000
npm run build    # Build for production
npm run preview  # Preview production build locally
```

### Useful URLs

| Service | Local | Docker |
|---------|-------|--------|
| Frontend | http://localhost:3000 | http://localhost:3000 |
| Backend API | http://localhost:5000/api | http://localhost:5000/api |
| Socket.io | ws://localhost:5000 | ws://localhost:5000 |

---

**🎉 You're all set! Happy chatting!**

For detailed documentation, see [COMPLETE_README.md](./COMPLETE_README.md)
