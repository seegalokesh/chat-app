const { Server } = require('socket.io');
const { authenticateSocket } = require('../middleware/auth');
const registerMessageHandlers = require('./handlers/messageHandler');
const registerRoomHandlers = require('./handlers/roomHandler');
const registerPresenceHandlers = require('./handlers/presenceHandler');
const registerTypingHandlers = require('./handlers/typingHandler');

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
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
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log(`[socket] ${socket.user.username} connected`);

    // Register all handler groups
    registerPresenceHandlers(io, socket);
    registerRoomHandlers(io, socket);
    registerMessageHandlers(io, socket);
    registerTypingHandlers(io, socket);
  });

  return io;
}

module.exports = initSocket;