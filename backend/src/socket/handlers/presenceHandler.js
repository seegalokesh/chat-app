const User = require('../../models/User');

module.exports = function registerPresenceHandlers(io, socket) {
  // Mark online on connect
  User.updateStatus(socket.user.id, 'online');
  io.emit('presence:online', { userId: socket.user.id });

  socket.on('disconnect', () => {
    User.updateStatus(socket.user.id, 'offline');
    io.emit('presence:offline', { userId: socket.user.id });
  });
};