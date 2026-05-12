import { useCallback } from 'react';
import { useContext } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import { useSocket } from './useSocket';

/**
 * Convenience hook that combines ChatContext state with
 * imperative socket actions so components don't need to
 * import both contexts separately.
 */
export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside <ChatProvider>');
  return ctx;
}

/**
 * Returns helpers for working with a specific chat target
 * (a room or conversation). Pass activeChat from ChatContext.
 */
export function useChatActions(activeChat) {
  const { socket } = useSocket();

  const sendMessage = useCallback((content) => {
    if (!socket || !activeChat || !content.trim()) return;
    socket.emit('message:send', {
      content: content.trim(),
      roomId: activeChat.type === 'room' ? activeChat.id : undefined,
      convId: activeChat.type === 'conv' ? activeChat.id : undefined
    });
  }, [socket, activeChat]);

  const editMessage = useCallback((messageId, content) => {
    if (!socket || !content.trim()) return;
    socket.emit('message:edit', { messageId, content: content.trim() });
  }, [socket]);

  const deleteMessage = useCallback((messageId) => {
    if (!socket || !activeChat) return;
    socket.emit('message:delete', {
      messageId,
      roomId: activeChat.type === 'room' ? activeChat.id : undefined,
      convId: activeChat.type === 'conv' ? activeChat.id : undefined
    });
  }, [socket, activeChat]);

  const markRead = useCallback((messageId) => {
    if (!socket || !activeChat || activeChat.type !== 'conv') return;
    socket.emit('message:read', { messageId, convId: activeChat.id });
  }, [socket, activeChat]);

  const startTyping = useCallback(() => {
    if (!socket || !activeChat) return;
    socket.emit('typing:start', {
      roomId: activeChat.type === 'room' ? activeChat.id : undefined,
      convId: activeChat.type === 'conv' ? activeChat.id : undefined
    });
  }, [socket, activeChat]);

  const stopTyping = useCallback(() => {
    if (!socket || !activeChat) return;
    socket.emit('typing:stop', {
      roomId: activeChat.type === 'room' ? activeChat.id : undefined,
      convId: activeChat.type === 'conv' ? activeChat.id : undefined
    });
  }, [socket, activeChat]);

  return { sendMessage, editMessage, deleteMessage, markRead, startTyping, stopTyping };
}