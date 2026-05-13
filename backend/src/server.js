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

// Security & middleware
app.use(helmet());
app.use(cors({ 
  origin: function(origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'https://chat-app-git-main-seegalokeshs-projects.vercel.app',
      'https://chat-jiek3xamk-seegalokeshs-projects.vercel.app',
      'http://localhost:5173',
      'http://localhost:3000'
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// Rate limiting on auth routes
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
runMigrations();
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/rooms',         require('./routes/rooms'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/users',         require('./routes/users'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Init Socket.io
initSocket(server);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app, server };