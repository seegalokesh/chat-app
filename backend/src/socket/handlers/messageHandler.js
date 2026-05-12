const Message = require('../../models/Message');
const Room = require('../../models/Room');
const Conversation = require('../../models/Conversation');

module.exports = function registerMessageHandlers(io, socket) {
  // Send message to a room
  socket.on('message:send', ({ roomId, convId, content }) => {
    if (!content?.trim()) return;

    const isRoom = !!roomId;

    // Permission checks
    if (isRoom && !Room.isMember(roomId, socket.user.id)) {
      return socket.emit('error', { message: 'Not a room member' });
    }
    if (!isRoom && convId && !Conversation.isParticipant(convId, socket.user.id)) {
      return socket.emit('error', { message: 'Not a conversation participant' });
    }

    const message = Message.create({
      content: content.trim(),
      senderId: socket.user.id,
      roomId: isRoom ? roomId : null,
      convId: !isRoom ? convId : null
    });

    // Handle @mentions
    const mentions = [...content.matchAll(/@(\w+)/g)].map(m => m[1]);
    if (mentions.length > 0) {
      // Notify mentioned users via socket
      io.emit('mention', { message, mentions });
    }

    if (isRoom) {
      io.to(`room:${roomId}`).emit('message:new', message);
    } else {
      io.to(`conv:${convId}`).emit('message:new', message);
    }
  });

  // Edit message
  socket.on('message:edit', ({ messageId, content }) => {
    const updated = Message.update(messageId, content.trim(), socket.user.id);
    if (!updated) return socket.emit('error', { message: 'Cannot edit message' });

    const room = `room:${updated.room_id}`;
    const conv = `conv:${updated.conv_id}`;
    const target = updated.room_id ? room : conv;
    io.to(target).emit('message:edited', updated);
  });

  // Delete message
  socket.on('message:delete', ({ messageId, roomId, convId }) => {
    const ok = Message.delete(messageId, socket.user.id);
    if (!ok) return socket.emit('error', { message: 'Cannot delete message' });

    const target = roomId ? `room:${roomId}` : `conv:${convId}`;
    io.to(target).emit('message:deleted', { messageId, roomId, convId });
  });

  // Mark messages as read (private convs)
  socket.on('message:read', ({ messageId, convId }) => {
    Message.markRead(messageId, socket.user.id);
    const receipts = Message.getReadReceipts(messageId);
    io.to(`conv:${convId}`).emit('message:read_receipt', { messageId, receipts });
  });
};