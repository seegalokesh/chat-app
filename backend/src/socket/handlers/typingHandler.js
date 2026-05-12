module.exports = function registerTypingHandlers(io, socket) {
  socket.on('typing:start', ({ roomId, convId }) => {
    const target = roomId ? `room:${roomId}` : `conv:${convId}`;
    socket.to(target).emit('typing:start', {
      userId: socket.user.id,
      username: socket.user.username,
      roomId,
      convId
    });
  });

  socket.on('typing:stop', ({ roomId, convId }) => {
    const target = roomId ? `room:${roomId}` : `conv:${convId}`;
    socket.to(target).emit('typing:stop', {
      userId: socket.user.id,
      roomId,
      convId
    });
  });
};