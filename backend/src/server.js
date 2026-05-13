require('dotenv').config();
const { runMigrations } = require('./db/migrations');
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const initSocket = require('./socket');

const app = express();
const server = http.createServer(app);

// 🔒 Security
app.use(helmet());

// 🔥 CORS FIX (FINAL WORKING VERSION)
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://chat-app-git-main-seegalokeshs-projects.vercel.app',
  'https://chat-jiek3xamk-seegalokeshs-projects.vercel.app',
  'https://chat-87tdznkdw-seegalokeshs-projects.vercel.app',
  'https://chat-app-gamma-five-79.vercel.app',
  'https://chat-6cmjmvjyx-seegalokeshs-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman, mobile apps

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      return callback(null, false); // ❗ DO NOT throw error
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 🔥 HANDLE PREFLIGHT REQUESTS (CRITICAL)
app.options("*", cors());

// 📦 Middleware
app.use(express.json());
app.use(morgan('dev'));

// 🔍 Health check
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// 🚫 Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
});

// 🛠️ Run DB migrations
runMigrations();

// 🔐 Auth routes with limiter
app.use('/api/auth', authLimiter, require('./routes/auth'));

// 📡 Other routes
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/users', require('./routes/users'));

// ❌ Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 🔌 Socket.io
initSocket(server);

// 🚀 Start server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };