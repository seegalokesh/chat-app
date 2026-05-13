# 🔑 Complete Deployment Configuration Guide

This guide provides all the environment variable keys and configuration needed to deploy the Chat Application to production platforms.

---

## 📋 Quick Reference: All Required Keys

### Backend Environment Variables (Render.com)
```
PORT=5000
NODE_ENV=production
JWT_SECRET=<generate-strong-random-secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-domain.vercel.app
DB_PATH=/data/chat.db
SOCKET_PORT=5000
```

### Frontend Environment Variables (Vercel)
```
VITE_API_URL=https://your-backend-domain.onrender.com/api
VITE_SOCKET_URL=https://your-backend-domain.onrender.com
VITE_APP_NAME=Chat App
```

---

## 🔐 Environment Variable Descriptions

### Backend Variables

| Variable | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `PORT` | Number | ✅ | Server port | `5000` |
| `NODE_ENV` | String | ✅ | Environment (development/production) | `production` |
| `JWT_SECRET` | String | ✅ | Secret key for JWT signing (use strong random string) | Generate with: `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | String | ✅ | JWT token expiration | `7d` (7 days) |
| `CLIENT_URL` | URL | ✅ | Frontend domain for CORS | `https://mychatapp.vercel.app` |
| `DB_PATH` | Path | ✅ | SQLite database path (use /data for Render persistence) | `/data/chat.db` |
| `SOCKET_PORT` | Number | ⚠️ | Socket.io port (usually same as PORT) | `5000` |

### Frontend Variables

| Variable | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `VITE_API_URL` | URL | ✅ | Backend API base URL | `https://chat-backend-xxxx.onrender.com/api` |
| `VITE_SOCKET_URL` | URL | ✅ | Backend Socket.io URL | `https://chat-backend-xxxx.onrender.com` |
| `VITE_APP_NAME` | String | ⚠️ | Application display name | `Chat App` |

---

## 🚀 Deployment Step-by-Step

### Prerequisites
- GitHub repository with your code
- Render account (https://render.com)
- Vercel account (https://vercel.com)

---

## BACKEND DEPLOYMENT (Render.com)

### Step 1: Prepare Backend for Production

1. Ensure your repository is up-to-date:
```bash
cd d:\chat-app
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Step 2: Create Web Service on Render

1. Log in to https://render.com
2. Click **New → Web Service**
3. Select your GitHub repository
4. Configure service:
   - **Name**: `chat-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Choose appropriate tier

### Step 3: Generate JWT Secret

Generate a strong random secret (do this locally first):
```bash
# Windows PowerShell:
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((1..32 | ForEach-Object {[char][byte](Get-Random -Minimum 33 -Maximum 127))} | Join-String))) | % {$_ -replace '([A-Za-z0-9+/]{76})','$1`n'}

# Or use online generator: https://generate-random.org/
# Minimum 32 characters, mix of uppercase, lowercase, numbers, symbols
```

**Example JWT_SECRET**: `K7mP$xQ9nL2wRvT@5ZjF3bC8dE1gH4jK6s`

### Step 4: Add Environment Variables in Render

1. Go to **Environment** tab in your service settings
2. Click **Add Environment Variable** and add each key:

```
PORT = 5000
NODE_ENV = production
JWT_SECRET = <your-generated-secret-here>
JWT_EXPIRES_IN = 7d
CLIENT_URL = https://your-frontend-domain.vercel.app
DB_PATH = /data/chat.db
SOCKET_PORT = 5000
```

### Step 5: Add Persistent Disk (Important!)

1. Go to **Disks** tab
2. Click **Add Disk**
   - **Mount Path**: `/data`
   - **Size**: 1 GB (starts at 1GB, can scale)
3. This ensures your SQLite database persists across deployments

### Step 6: Deploy

1. Click **Create Web Service**
2. Render builds and deploys automatically
3. Monitor **Logs** tab for deployment progress
4. Once deployed, copy your backend URL:
   - Format: `https://chat-backend-xxxx.onrender.com`
   - Save this URL for frontend configuration

### Step 7: Health Check

Test your backend:
```bash
curl https://chat-backend-xxxx.onrender.com/
# Should see: "Backend is running 🚀"
```

---

## FRONTEND DEPLOYMENT (Vercel)

### Step 1: Prepare Frontend

The frontend code is already in `/frontend` directory with proper Vite configuration.

### Step 2: Connect to Vercel

1. Log in to https://vercel.com
2. Click **Add New → Project**
3. **Import Git Repository**
4. Select your chat-app repository
5. Click **Import**

### Step 3: Configure Build Settings

Vercel should auto-detect the setup, but verify:

1. **Framework Preset**: `Vite`
2. **Build Command**: `cd frontend && npm run build`
3. **Output Directory**: `frontend/dist`
4. **Install Command**: (auto, or `npm install`)

### Step 4: Add Frontend Environment Variables

1. Go to **Settings → Environment Variables**
2. Add variables for all environments (Production, Preview, Development):

```
VITE_API_URL = https://chat-backend-xxxx.onrender.com/api
VITE_SOCKET_URL = https://chat-backend-xxxx.onrender.com
VITE_APP_NAME = Chat App
```

Replace `chat-backend-xxxx.onrender.com` with your actual Render backend domain.

### Step 5: Deploy

1. Click **Deploy**
2. Vercel automatically builds from your GitHub repository
3. Monitor deployment progress in the **Deployments** tab
4. Once complete, you'll get your frontend URL:
   - Format: `https://your-project-name.vercel.app`

### Step 6: Update Backend CORS

Now that frontend is deployed, update backend `CLIENT_URL`:

1. Go back to Render backend service
2. Go to **Environment** tab
3. Update `CLIENT_URL` to your Vercel domain: `https://your-project-name.vercel.app`
4. Redeploy backend by clicking **Manual Deploy** or push to GitHub

---

## 🔄 Configuration Flow

```
User (Frontend on Vercel)
    ↓
VITE_API_URL → Backend API on Render
    ↓
Backend (Render)
    ↓
CLIENT_URL (CORS) ← Vercel Domain
    ↓
SQLite Database (/data persistent disk)
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend deployed on Render and running
- [ ] Persistent disk configured for database
- [ ] Frontend deployed on Vercel
- [ ] Environment variables set on both platforms
- [ ] Backend CORS updated with frontend URL
- [ ] Frontend API/Socket URLs point to backend
- [ ] Test login/authentication
- [ ] Test real-time chat functionality
- [ ] Test Socket.io connection
- [ ] Monitor error logs
- [ ] Set up continuous deployment (auto-deploy on push)

---

## 🔍 Testing the Deployment

### Test Backend

```bash
# Health check
curl https://chat-backend-xxxx.onrender.com/

# Test API (example: login)
curl -X POST https://chat-backend-xxxx.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Test Frontend

1. Open https://your-project-name.vercel.app
2. Try to register/login
3. Verify real-time chat works (Socket.io connection)
4. Check browser console for any errors

---

## 🐛 Troubleshooting

### Issue: CORS Error
**Solution**: Verify `CLIENT_URL` in backend matches your Vercel domain exactly (including https://)

### Issue: Cannot connect to backend API
**Solution**: Verify `VITE_API_URL` in frontend is correct and backend is running

### Issue: Socket.io connection fails
**Solution**: Ensure `VITE_SOCKET_URL` matches backend domain, check CORS settings

### Issue: Database not persisting
**Solution**: Ensure persistent disk is mounted at `/data` in Render

### Issue: JWT errors
**Solution**: Regenerate `JWT_SECRET` and restart backend service

### Check Logs

**Render Backend Logs**:
1. Go to service → **Logs** tab
2. Look for errors in deployment or runtime

**Vercel Frontend Logs**:
1. Go to deployment → **Functions** tab
2. Or check browser console (F12)

---

## 📊 Environment Variables Summary

### Render Backend Service
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=<strong-random-32-char-string>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-vercel-app.vercel.app
DB_PATH=/data/chat.db
SOCKET_PORT=5000
```

### Vercel Frontend Project
```env
VITE_API_URL=https://your-render-app.onrender.com/api
VITE_SOCKET_URL=https://your-render-app.onrender.com
VITE_APP_NAME=Chat App
```

---

## 🔐 Security Best Practices

1. ✅ Use strong, random JWT_SECRET (min 32 characters)
2. ✅ Never commit `.env` files to GitHub
3. ✅ Set `NODE_ENV=production` on Render
4. ✅ Use HTTPS URLs only (both platforms provide this by default)
5. ✅ Regularly rotate JWT_SECRET if compromised
6. ✅ Monitor error logs for suspicious activity
7. ✅ Set up rate limiting on authentication endpoints
8. ✅ Use persistent disks for critical data

---

## 📚 Additional Resources

- Render Documentation: https://render.com/docs
- Vercel Documentation: https://vercel.com/docs
- Socket.io CORS: https://socket.io/docs/v4/socket-io-server-options/#cors
- Express CORS: https://expressjs.com/en/resources/middleware/cors.html

---

**Last Updated**: May 2026
**Version**: 1.0
