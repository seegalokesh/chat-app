const { Server } = require('socket.io');
const { authenticateSocket } = require('../middleware/auth');
const registerMessageHandlers = require('./handlers/messageHandler');
const registerRoomHandlers = require('./handlers/roomHandler');
const registerPresenceHandlers = require('./handlers/presenceHandler');
const registerTypingHandlers = require('./handlers/typingHandler');

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
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