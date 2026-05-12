const Room = require('../../models/Room');

module.exports = function registerRoomHandlers(io, socket) {
  socket.on('room:join', ({ roomId }) => {
    const room = Room.findById(roomId);
    if (!room) return socket.emit('error', { message: 'Room not found' });

    Room.addMember(roomId, socket.user.id);
    socket.join(`room:${roomId}`);

    // Notify room of new member
    socket.to(`room:${roomId}`).emit('room:user_joined', {
      roomId,
      user: socket.user
    });
    socket.emit('room:joined', { room, members: Room.getMembers(roomId) });
  });

  socket.on('room:leave', ({ roomId }) => {
    socket.leave(`room:${roomId}`);
    socket.to(`room:${roomId}`).emit('room:user_left', {
      roomId,
      userId: socket.user.id
    });
  });

  socket.on('conv:join', ({ convId }) => {
    socket.join(`conv:${convId}`);
  });
};