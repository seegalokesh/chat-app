# ⚡ QUICK START: 5-MINUTE DEPLOYMENT GUIDE

This is the fastest way to get your chat app running in production!

---

## 🎯 What You Need Before Starting

- [x] GitHub account with your code pushed
- [x] Render account (https://render.com) - **Free to start**
- [x] Vercel account (https://vercel.com) - **Free to start**
- [x] 10-15 minutes of free time

---

## 📋 5-Step Deployment Process

### STEP 1: Generate JWT Secret (2 min)

**Windows PowerShell**:
```powershell
[Convert]::ToBase64String(([System.Text.Encoding]::UTF8.GetBytes((-join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_}))))) -replace "`n"
```

**Copy the output** → This is your `JWT_SECRET`

---

### STEP 2: Deploy Backend to Render (5 min)

1. Go to https://render.com and sign in
2. Click **New → Web Service**
3. Select your GitHub repo
4. Fill in:
   - Name: `chat-backend`
   - Build: `cd backend && npm install`
   - Start: `cd backend && npm start`
5. Click **Create Web Service** (stays on page)
6. Go to **Environment** tab → Add variables:

```
PORT = 5000
NODE_ENV = production
JWT_SECRET = [PASTE YOUR SECRET FROM STEP 1]
JWT_EXPIRES_IN = 7d
CLIENT_URL = https://you-will-get-this-in-step-4.vercel.app
DB_PATH = /data/chat.db
SOCKET_PORT = 5000
```

7. Go to **Disks** tab → Click **Add Disk**
   - Mount Path: `/data`
   - Size: `1 GB`
8. Wait for build to complete (~3-5 min)
9. **Copy your Render URL**: `https://chat-backend-XXXXX.onrender.com`

---

### STEP 3: Deploy Frontend to Vercel (3 min)

1. Go to https://vercel.com and sign in
2. Click **Add New → Project**
3. **Import** your GitHub repo
4. Vercel auto-detects Vite setup ✓
5. Click **Deploy**
6. Wait for build (~2 min)
7. **Copy your Vercel URL**: `https://your-project-XXXXX.vercel.app`

---

### STEP 4: Connect Frontend URL to Backend (1 min)

Back to Render:
1. Go to your `chat-backend` service
2. **Environment** tab
3. Edit `CLIENT_URL` → Paste your Vercel URL from Step 3
4. Click **Save**
5. Service auto-redeploys (~2 min) ✓

---

### STEP 5: Connect Backend URL to Frontend (1 min)

Back to Vercel:
1. Go to your project **Settings**
2. **Environment Variables**
3. Add these two variables:

```
VITE_API_URL = https://chat-backend-XXXXX.onrender.com/api
VITE_SOCKET_URL = https://chat-backend-XXXXX.onrender.com
```

(Replace `chat-backend-XXXXX.onrender.com` with your actual Render domain from Step 2)

4. **Deployments** → Click **Redeploy** on latest deployment
5. Wait for rebuild (~1 min)

---

## ✅ YOU'RE DONE! Test It

1. Open your Vercel URL: `https://your-project-XXXXX.vercel.app`
2. Register a new account
3. Create a room or conversation
4. Test real-time chat (open in another browser tab to see real-time updates)

---

## 🎯 Key Values Summary

| What | Where | Value |
|------|-------|-------|
| Backend URL | Render | `https://chat-backend-XXXXX.onrender.com` |
| Frontend URL | Vercel | `https://your-project-XXXXX.vercel.app` |
| JWT Secret | Backend Env | Generate with PowerShell command ↑ |

---

## 🆘 If Something Goes Wrong

| Problem | Solution |
|---------|----------|
| "Cannot connect to backend" | Check `VITE_API_URL` is correct in Vercel Environment |
| "CORS error" | Check `CLIENT_URL` in Render matches your Vercel domain exactly |
| "Database not found" | Add persistent disk at `/data` in Render |
| "Socket.io not connecting" | Check `VITE_SOCKET_URL` matches Render domain |

---

## 📚 Full Guides

- Detailed deployment: See `DEPLOYMENT_KEYS.md`
- Environment variables: See `DEPLOYMENT_KEYS_REFERENCE.md`
- Full architecture: See `ARCHITECTURE.md`

---

**That's it! Your chat app is now live! 🎉**

Created: May 2026
