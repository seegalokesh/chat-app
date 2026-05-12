# 🚀 Deployment Guide

Complete step-by-step guide for deploying the Chat Application to production on various platforms.

## Table of Contents
- [Render.com](#rendercom)
- [Vercel (Frontend)](#vercel-frontend)
- [Self-Hosted (AWS EC2, DigitalOcean, etc.)](#self-hosted)
- [Production Checklist](#production-checklist)

---

## Render.com

### Backend Deployment (Node.js Web Service)

#### Step 1: Prepare Repository

```bash
# Ensure your GitHub repo is up-to-date
git add .
git commit -m "Ready for production deployment"
git push origin main
```

#### Step 2: Create Web Service on Render

1. Log in to [render.com](https://render.com)
2. Click **New → Web Service**
3. Select your GitHub repository
4. Configure:
   - **Name**: `chat-backend` (or your choice)
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Choose appropriate tier (Starter for dev/testing)

#### Step 3: Add Environment Variables

1. Go to **Environment** tab
2. Add variables:
   ```
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=<generate-strong-random-secret>
   JWT_EXPIRES_IN=7d
   CLIENT_URL=https://your-frontend-domain.vercel.app
   DB_PATH=/data/chat.db
   ```

> **Generate JWT_SECRET**: `openssl rand -base64 32`

#### Step 4: Add Persistent Disk

1. Go to **Disks** tab
2. Click **Add Disk**
   - **Mount Path**: `/data`
   - **Size**: 1 GB (adjust as needed)
3. Render will store SQLite data here persistently

#### Step 5: Deploy

1. Click **Create Web Service**
2. Render builds and deploys automatically
3. Monitor logs in **Logs** tab
4. Copy your backend URL: `https://chat-backend-xxxx.onrender.com`

#### Step 6: Update Frontend Environment

Once backend is deployed, update frontend `.env`:
```env
VITE_API_URL=https://chat-backend-xxxx.onrender.com/api
VITE_SOCKET_URL=https://chat-backend-xxxx.onrender.com
```

---

## Vercel (Frontend)

### Frontend Deployment

#### Step 1: Push Code to GitHub

```bash
git push origin main
```

#### Step 2: Create Project on Vercel

1. Log in to [vercel.com](https://vercel.com)
2. Click **Add New → Project**
3. Import your GitHub repository
4. Select the repository containing the chat app

#### Step 3: Configure Build Settings

1. **Framework Preset**: `Vite`
2. **Build Command**: `npm run build` (from frontend directory)
   - Override with: `cd frontend && npm run build`
3. **Output Directory**: `frontend/dist`
4. **Install Command**: `npm install` (from frontend directory)
   - Override with: `cd frontend && npm install`

#### Step 4: Add Environment Variables

1. Go to **Settings → Environment Variables**
2. Add for all environments:
   ```
   VITE_API_URL=https://chat-backend-xxxx.onrender.com/api
   VITE_SOCKET_URL=https://chat-backend-xxxx.onrender.com
   ```

#### Step 5: Deploy

1. Click **Deploy**
2. Vercel builds and deploys automatically
3. Your frontend is live at: `https://chat-frontend-xxxx.vercel.app`

#### Step 6: Configure Custom Domain (Optional)

1. In **Settings → Domains**
2. Add your custom domain
3. Update DNS records per Vercel instructions

---

## Self-Hosted

### AWS EC2 / DigitalOcean / Linode

#### Prerequisites

- Linux server (Ubuntu 20.04+)
- SSH access
- Domain name with DNS access
- SSL certificate (use Let's Encrypt)

#### Step 1: Set Up Server

```bash
# SSH into your server
ssh ubuntu@your-server-ip

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js 20
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker & Docker Compose (recommended)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx for reverse proxy
sudo apt-get install -y nginx
```

#### Step 2: Clone Repository

```bash
# Clone your repo
git clone https://github.com/yourusername/chat-app.git
cd chat-app

# Create data directory for SQLite
mkdir -p data
```

#### Step 3: Configure Environment Files

```bash
# Backend
cp backend/.env.example backend/.env
sudo nano backend/.env
# Set:
# NODE_ENV=production
# JWT_SECRET=<strong-secret>
# CLIENT_URL=https://yourdomain.com

# Frontend
cp frontend/.env.example frontend/.env
sudo nano frontend/.env
# Set:
# VITE_API_URL=https://yourdomain.com/api
# VITE_SOCKET_URL=https://yourdomain.com
```

#### Step 4a: Deploy with Docker Compose (Recommended)

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Verify
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### Step 4b: Deploy Without Docker

```bash
# Backend setup
cd backend
npm install
npm run build  # if applicable
nohup npm start > backend.log 2>&1 &

# Frontend setup (in another terminal)
cd frontend
npm install
npm run build

# Serve with Nginx (see step 5)
```

#### Step 5: Configure Nginx Reverse Proxy

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/chat-app
```

```nginx
upstream backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates (from Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # API proxy
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io proxy
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Frontend static files
    location / {
        root /var/www/chat-app/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

#### Step 6: Enable Nginx Config

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/chat-app /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Step 7: Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal (already configured)
sudo systemctl enable certbot.timer
```

#### Step 8: Set Up Automatic Restarts (Systemd)

```bash
# Create backend service file
sudo nano /etc/systemd/system/chat-backend.service
```

```ini
[Unit]
Description=Chat Application Backend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/chat-app/backend
Environment="NODE_ENV=production"
EnvironmentFile=/home/ubuntu/chat-app/backend/.env
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable chat-backend
sudo systemctl start chat-backend

# Check status
sudo systemctl status chat-backend
```

#### Step 9: Monitor Application

```bash
# Check logs
sudo journalctl -u chat-backend -f

# Check disk usage
df -h

# Check process
ps aux | grep node

# Check port bindings
sudo netstat -tulpn | grep 5000
```

---

## Production Checklist

### Security

- [ ] Change all default values
- [ ] Set strong `JWT_SECRET` (use `openssl rand -base64 32`)
- [ ] Enable HTTPS/SSL certificate
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS whitelist in `CLIENT_URL`
- [ ] Use environment variables for all secrets (never in code)
- [ ] Disable SQL query logging in production
- [ ] Set up rate limiting for auth endpoints
- [ ] Use strong passwords in database
- [ ] Enable firewall rules

### Performance

- [ ] Enable gzip compression (done in nginx.conf)
- [ ] Set appropriate cache headers for static assets
- [ ] Use CDN for static files (optional)
- [ ] Optimize database indexes
- [ ] Monitor query performance
- [ ] Set up database backups

### Monitoring & Logging

- [ ] Set up log aggregation (e.g., LogRocket, Sentry)
- [ ] Monitor server CPU/memory/disk
- [ ] Alert on error rates
- [ ] Track response times
- [ ] Monitor WebSocket connections
- [ ] Set up uptime monitoring

### Backups & Disaster Recovery

- [ ] Daily SQLite backups to cloud storage (S3, etc.)
- [ ] Document recovery procedure
- [ ] Test backup restoration regularly
- [ ] Set up automated backups with cron
- [ ] Monitor backup job status

### Deployment

- [ ] Use environment-specific configs
- [ ] Version all deployments in Git
- [ ] Test all changes in staging first
- [ ] Use zero-downtime deployment strategies
- [ ] Document deployment procedures
- [ ] Have rollback plans

### Post-Deployment

- [ ] Verify all features work in production
- [ ] Check SSL certificate validity
- [ ] Verify database persistence
- [ ] Test user authentication flow
- [ ] Monitor error rates and performance
- [ ] Set up alerts for anomalies

---

## Troubleshooting

### Backend won't start

```bash
# Check logs
npm run dev

# Common issues:
# 1. Port 5000 already in use
lsof -i :5000
kill -9 <PID>

# 2. DATABASE locked
rm chat.db-shm chat.db-wal

# 3. Missing dependencies
npm install

# 4. JWT_SECRET not set
echo $JWT_SECRET
```

### Socket.io connection fails

```
Check:
- Backend is running (port 5000)
- CLIENT_URL matches frontend domain
- CORS is not blocking connections
- Firewall allows port 5000
```

### Frontend build fails

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### SSL certificate issues

```bash
# Check certificate
sudo openssl x509 -in /etc/letsencrypt/live/yourdomain.com/fullchain.pem -text -noout

# Renew if expiring soon
sudo certbot renew

# Force renewal
sudo certbot renew --force-renewal
```

---

**Happy Deploying! 🚀**
