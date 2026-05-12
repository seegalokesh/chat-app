import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import api from '../utils/api';

export const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});       // { "room:id" or "conv:id": [...] }
  const [activeChat, setActiveChat] = useState(null); // { type: 'room'|'conv', id, name }
  const [typingUsers, setTypingUsers] = useState({}); // { "room:id": { userId: username } }
  const [onlineUsers, setOnlineUsers] = useState({}); // { userId: true }

  // Load initial data
  useEffect(() => {
    if (!user) return;
    api.get('/rooms').then(r => setRooms(r.data));
    api.get('/conversations').then(r => setConversations(r.data));
  }, [user]);

  // Load messages when chat changes
  useEffect(() => {
    if (!activeChat || !socket) return;
    const key = `${activeChat.type}:${activeChat.id}`;
    if (messages[key]) return; // Already loaded

    const endpoint = activeChat.type === 'room'
      ? `/rooms/${activeChat.id}/messages`
      : `/conversations/${activeChat.id}/messages`;

    api.get(endpoint).then(r => {
      setMessages(prev => ({ ...prev, [key]: r.data }));
    });

    // Join the socket room/conv
    if (activeChat.type === 'room') {
      socket.emit('room:join', { roomId: activeChat.id });
    } else {
      socket.emit('conv:join', { convId: activeChat.id });
    }
  }, [activeChat, socket]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (msg) => {
      const key = msg.room_id ? `room:${msg.room_id}` : `conv:${msg.conv_id}`;
      setMessages(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), msg]
      }));
    };

    const onEditedMessage = (msg) => {
      const key = msg.room_id ? `room:${msg.room_id}` : `conv:${msg.conv_id}`;
      setMessages(prev => ({
        ...prev,
        [key]: (prev[key] || []).map(m => m.id === msg.id ? msg : m)
      }));
    };

    const onDeletedMessage = ({ messageId, roomId, convId }) => {
      const key = roomId ? `room:${roomId}` : `conv:${convId}`;
      setMessages(prev => ({
        ...prev,
        [key]: (prev[key] || []).map(m =>
          m.id === messageId ? { ...m, is_deleted: 1, content: '[deleted]' } : m
        )
      }));
    };

    const onTypingStart = ({ userId, username, roomId, convId }) => {
      const key = roomId ? `room:${roomId}` : `conv:${convId}`;
      setTypingUsers(prev => ({
        ...prev,
        [key]: { ...(prev[key] || {}), [userId]: username }
      }));
    };

    const onTypingStop = ({ userId, roomId, convId }) => {
      const key = roomId ? `room:${roomId}` : `conv:${convId}`;
      setTypingUsers(prev => {
        const updated = { ...(prev[key] || {}) };
        delete updated[userId];
        return { ...prev, [key]: updated };
      });
    };

    const onUserOnline  = ({ userId }) => setOnlineUsers(p => ({ ...p, [userId]: true }));
    const onUserOffline = ({ userId }) => setOnlineUsers(p => { const n = {...p}; delete n[userId]; return n; });

    socket.on('message:new',     onNewMessage);
    socket.on('message:edited',  onEditedMessage);
    socket.on('message:deleted', onDeletedMessage);
    socket.on('typing:start',    onTypingStart);
    socket.on('typing:stop',     onTypingStop);
    socket.on('presence:online', onUserOnline);
    socket.on('presence:offline',onUserOffline);

    return () => {
      socket.off('message:new',     onNewMessage);
      socket.off('message:edited',  onEditedMessage);
      socket.off('message:deleted', onDeletedMessage);
      socket.off('typing:start',    onTypingStart);
      socket.off('typing:stop',     onTypingStop);
      socket.off('presence:online', onUserOnline);
      socket.off('presence:offline',onUserOffline);
    };
  }, [socket]);

  const sendMessage = useCallback((content) => {
    if (!socket || !activeChat || !content.trim()) return;
    socket.emit('message:send', {
      content,
      roomId: activeChat.type === 'room' ? activeChat.id : undefined,
      convId: activeChat.type === 'conv' ? activeChat.id : undefined
    });
  }, [socket, activeChat]);

  const sendTyping = useCallback((isTyping) => {
    if (!socket || !activeChat) return;
    const event = isTyping ? 'typing:start' : 'typing:stop';
    socket.emit(event, {
      roomId: activeChat.type === 'room' ? activeChat.id : undefined,
      convId: activeChat.type === 'conv' ? activeChat.id : undefined
    });
  }, [socket, activeChat]);

  const activeKey = activeChat ? `${activeChat.type}:${activeChat.id}` : null;
  const currentMessages = activeKey ? (messages[activeKey] || []) : [];
  const currentTyping = activeKey ? (typingUsers[activeKey] || {}) : {};

  return (
    <ChatContext.Provider value={{
      rooms, setRooms,
      conversations, setConversations,
      activeChat, setActiveChat,
      currentMessages,
      currentTyping,
      onlineUsers,
      sendMessage,
      sendTyping
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);