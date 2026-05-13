# 🔐 DEPLOYMENT KEYS & VALUES REFERENCE

This document provides a complete checklist of all environment variable keys and their values that you need for deployment.

---

## 📝 STEP 1: Generate Required Secrets

### Generate JWT_SECRET (Backend)

Run one of these commands to generate a strong random secret:

#### Option A: Windows PowerShell
```powershell
$secret = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_}))))
$secret
```

#### Option B: OpenSSL (if installed)
```bash
openssl rand -base64 32
```

#### Option C: Online Generator
Visit: https://generate-random.org/ and generate a 32+ character string

**Save this value**: `JWT_SECRET = ___________________________`

---

## 🎯 STEP 2: Deployment Variables Checklist

### ✅ BACKEND (Render.com)

Copy each variable name and value into Render's Environment Variables section:

```
PORT
Value: 5000

NODE_ENV
Value: production

JWT_SECRET
Value: [Copy from Step 1 above]

JWT_EXPIRES_IN
Value: 7d

CLIENT_URL
Value: https://__________.vercel.app (your frontend URL, filled in Step 3)

DB_PATH
Value: /data/chat.db

SOCKET_PORT
Value: 5000
```

---

### ✅ FRONTEND (Vercel)

Copy each variable name and value into Vercel's Environment Variables section:

```
VITE_API_URL
Value: https://__________-backend.onrender.com/api (your backend URL + /api)

VITE_SOCKET_URL
Value: https://__________-backend.onrender.com (your backend URL, no /api)

VITE_APP_NAME
Value: Chat App
```

---

## 📋 DEPLOYMENT FLOW & VALUES

### Flow Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                  DEPLOYMENT CONFIGURATION                    │
└─────────────────────────────────────────────────────────────┘

1. Generate JWT_SECRET
   └─→ Use for: BACKEND JWT_SECRET

2. Deploy BACKEND to Render
   └─→ Get URL: https://your-backend-domain.onrender.com
   └─→ Use for: FRONTEND VITE_API_URL & VITE_SOCKET_URL
   └─→ Add Persistent Disk: /data

3. Deploy FRONTEND to Vercel
   └─→ Get URL: https://your-frontend-domain.vercel.app
   └─→ Use for: BACKEND CLIENT_URL
   └─→ Redeploy BACKEND with CLIENT_URL

4. Test & Verify
   └─→ Frontend connects to Backend ✓
   └─→ Socket.io connections work ✓
   └─→ Database persists ✓
```

---

## 🔑 COMPLETE KEY-VALUE PAIRS

Print this section and fill in your actual values:

### BACKEND Environment Variables (Render)

| Key | Value | Notes |
|-----|-------|-------|
| `PORT` | `5000` | Fixed value |
| `NODE_ENV` | `production` | Fixed value |
| `JWT_SECRET` | `[GENERATED_SECRET]` | **Generate yourself** |
| `JWT_EXPIRES_IN` | `7d` | Fixed value |
| `CLIENT_URL` | `https://[VERCEL_DOMAIN]` | **Your Vercel frontend URL** |
| `DB_PATH` | `/data/chat.db` | Fixed value (Render persistent disk) |
| `SOCKET_PORT` | `5000` | Fixed value |

### FRONTEND Environment Variables (Vercel)

| Key | Value | Notes |
|-----|-------|-------|
| `VITE_API_URL` | `https://[RENDER_DOMAIN]/api` | **Your Render backend URL + /api** |
| `VITE_SOCKET_URL` | `https://[RENDER_DOMAIN]` | **Your Render backend URL (no /api)** |
| `VITE_APP_NAME` | `Chat App` | Fixed value |

---

## 📊 ACTUAL VALUES TO FILL IN

### YOUR DEPLOYMENT INFORMATION

```
====== BACKEND INFORMATION (Render) ======
Service Name: chat-backend
Render Backend Domain: https://__________________________________.onrender.com
JWT Secret: ________________________________________________________________
(min 32 characters, random alphanumeric with special chars)

====== FRONTEND INFORMATION (Vercel) ======
Project Name: chat-frontend
Vercel Frontend Domain: https://__________________________________.vercel.app

====== LINKING VALUES ======
Backend URL (for Frontend): https://__________________________________.onrender.com
Backend API URL (for Frontend): https://__________________________________.onrender.com/api
Frontend URL (for Backend CORS): https://__________________________________.vercel.app
```

---

## 🚀 QUICK REFERENCE: WHERE TO PUT EACH KEY

### On Render (Backend Service)

Path: **Your Service → Settings → Environment**

```
PORT = 5000
NODE_ENV = production
JWT_SECRET = [YOUR_GENERATED_SECRET]
JWT_EXPIRES_IN = 7d
CLIENT_URL = https://[YOUR_VERCEL_URL].vercel.app
DB_PATH = /data/chat.db
SOCKET_PORT = 5000
```

### On Vercel (Frontend Project)

Path: **Your Project → Settings → Environment Variables**

```
VITE_API_URL = https://[YOUR_RENDER_URL].onrender.com/api
VITE_SOCKET_URL = https://[YOUR_RENDER_URL].onrender.com
VITE_APP_NAME = Chat App
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] JWT_SECRET generated (32+ characters, saved securely)
- [ ] Backend deployed to Render
- [ ] Persistent disk created at `/data` on Render
- [ ] All 7 backend environment variables added to Render
- [ ] Frontend deployed to Vercel
- [ ] All 3 frontend environment variables added to Vercel
- [ ] Backend CORS updated with Vercel frontend URL
- [ ] Backend redeployed after CORS update
- [ ] Frontend rebuilt with backend URL
- [ ] Tested: Frontend loads
- [ ] Tested: Can login/register
- [ ] Tested: Real-time chat works
- [ ] Tested: Socket.io connected

---

## 🔐 SECURITY NOTES

1. **JWT_SECRET**: 
   - ✅ Must be strong (32+ chars, mixed case, numbers, symbols)
   - ✅ Keep secret - never commit to Git
   - ✅ Use different secrets for different environments
   - ❌ Never use default/simple secrets in production

2. **CLIENT_URL**:
   - ✅ Must match your actual frontend domain exactly
   - ✅ Include https://
   - ✅ No trailing slash

3. **API URLs**:
   - ✅ Backend API URL must include `/api`
   - ✅ Socket URL must NOT include `/api`
   - ✅ Both must use https:// in production

---

## 🆘 IF YOU NEED TO CHANGE VALUES

### To update Backend variables on Render:
1. Go to service settings
2. Click "Environment" tab
3. Edit the variable
4. Click "Save"
5. Service auto-redeploys (takes 1-2 minutes)

### To update Frontend variables on Vercel:
1. Go to project settings
2. Click "Environment Variables"
3. Edit the variable
4. Trigger new deployment (push to GitHub or manual deploy)

---

## 📚 EXAMPLE FULL CONFIGURATION

### ❌ EXAMPLE - DO NOT COPY THESE VALUES (FOR REFERENCE ONLY)

**Backend (Render)**:
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=K7mP$xQ9nL2wRvT@5ZjF3bC8dE1gH4jK6s_EXAMPLE_ONLY
JWT_EXPIRES_IN=7d
CLIENT_URL=https://mychatapp.vercel.app
DB_PATH=/data/chat.db
SOCKET_PORT=5000
```

**Frontend (Vercel)**:
```env
VITE_API_URL=https://chat-backend-k7mp9nq2.onrender.com/api
VITE_SOCKET_URL=https://chat-backend-k7mp9nq2.onrender.com
VITE_APP_NAME=Chat App
```

---

**Created**: May 2026
**Version**: 1.0
