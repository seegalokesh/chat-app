# 🔑 DEPLOYMENT KEYS CHEAT SHEET

Quick reference card for all deployment environment variable keys and values.

---

## 🎯 THE 10 KEYS YOU NEED

### Backend (Render) - 7 Keys
1. `PORT` → `5000`
2. `NODE_ENV` → `production`
3. `JWT_SECRET` → `[GENERATE YOURSELF]`
4. `JWT_EXPIRES_IN` → `7d`
5. `CLIENT_URL` → `[YOUR VERCEL URL]`
6. `DB_PATH` → `/data/chat.db`
7. `SOCKET_PORT` → `5000`

### Frontend (Vercel) - 3 Keys
1. `VITE_API_URL` → `[YOUR RENDER URL]/api`
2. `VITE_SOCKET_URL` → `[YOUR RENDER URL]`
3. `VITE_APP_NAME` → `Chat App`

---

## 🔐 GENERATE JWT_SECRET

### Windows PowerShell (Recommended)
```powershell
[Convert]::ToBase64String(([System.Text.Encoding]::UTF8.GetBytes((-join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_}))))) -replace "`n"
```

### What You'll Get
```
Example output (DO NOT USE THIS):
K7mP$xQ9nL2wRvT@5ZjF3bC8dE1gH4jK6s9vW0xY2zA3bC4d
```

---

## 📋 DEPLOYMENT CHECKLIST

```
BEFORE DEPLOYMENT:
□ GitHub repo up-to-date
□ Generate JWT_SECRET
□ Render account created
□ Vercel account created

BACKEND (Render):
□ Create Web Service
□ Set Build: cd backend && npm install
□ Set Start: cd backend && npm start
□ Add 7 environment variables
□ Create disk at /data (1GB)
□ Note Backend URL: https://chat-backend-XXXXX.onrender.com

FRONTEND (Vercel):
□ Import GitHub repo
□ Verify Vite detected
□ Deploy
□ Note Frontend URL: https://project-XXXXX.vercel.app

LINKING:
□ Update Backend CLIENT_URL with Frontend URL
□ Redeploy Backend
□ Add Frontend environment variables
□ Redeploy Frontend

TESTING:
□ Frontend loads
□ Can login
□ Can chat in real-time
□ WebSocket connected
```

---

## 🚀 KEYS TO FILL IN

```
╔══════════════════════════════════════════════════════════╗
║  BACKEND ENVIRONMENT VARIABLES (Render)                 ║
╠══════════════════════════════════════════════════════════╣
║ PORT = 5000                                              ║
║ NODE_ENV = production                                    ║
║ JWT_SECRET = [YOUR GENERATED SECRET - 32+ CHARS]         ║
║ JWT_EXPIRES_IN = 7d                                      ║
║ CLIENT_URL = https://______________.vercel.app           ║
║ DB_PATH = /data/chat.db                                  ║
║ SOCKET_PORT = 5000                                       ║
╚══════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════╗
║  FRONTEND ENVIRONMENT VARIABLES (Vercel)                ║
╠══════════════════════════════════════════════════════════╣
║ VITE_API_URL = https://________________.onrender.com/api ║
║ VITE_SOCKET_URL = https://________________.onrender.com  ║
║ VITE_APP_NAME = Chat App                                ║
╚══════════════════════════════════════════════════════════╝
```

---

## ✅ DEPLOYMENT URLS

After deployment, you'll have:

```
Render Backend: https://chat-backend-XXXXX.onrender.com
Vercel Frontend: https://project-XXXXX.vercel.app

Use these in environment variables:
VITE_API_URL = https://chat-backend-XXXXX.onrender.com/api
VITE_SOCKET_URL = https://chat-backend-XXXXX.onrender.com
CLIENT_URL = https://project-XXXXX.vercel.app
```

---

## 🆘 QUICK TROUBLESHOOTING

| Problem | Check |
|---------|-------|
| Cannot connect API | VITE_API_URL correct? Includes `/api`? |
| CORS error | CLIENT_URL correct? Matches frontend URL? |
| Socket.io fails | VITE_SOCKET_URL correct? No `/api`? |
| DB not saving | Persistent disk at `/data` created? |
| Login fails | JWT_SECRET set? NODE_ENV=production? |

---

## 📚 WHERE TO FIND MORE

- Detailed guide: `DEPLOYMENT_KEYS.md`
- Full reference: `DEPLOYMENT_KEYS_REFERENCE.md`
- Quick start: `QUICK_DEPLOY.md`
- Complete overview: `DEPLOYMENT_COMPLETE.md`

---

**Created**: May 2026 | **Print & Keep Handy!**
