import { useContext, useEffect, useRef, useCallback } from 'react';
import { SocketContext } from '../contexts/SocketContext';

/**
 * Primary socket hook — returns the socket instance and connection state.
 */
export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside <SocketProvider>');
  return ctx;
}

/**
 * Subscribes to one or more socket events for the lifetime of the
 * component (or until deps change). Automatically cleans up on unmount.
 *
 * Usage:
 *   useSocketEvent('message:new', (msg) => { ... });
 *   useSocketEvent({ 'typing:start': onStart, 'typing:stop': onStop });
 */
export function useSocketEvent(eventOrMap, handler, deps = []) {
  const { socket } = useSocket();
  const handlerRef = useRef(handler);

  // Keep the ref up-to-date without re-subscribing on every render
  useEffect(() => { handlerRef.current = handler; });

  useEffect(() => {
    if (!socket) return;

    const isMap = typeof eventOrMap === 'object' && eventOrMap !== null;

    if (isMap) {
      const entries = Object.entries(eventOrMap);
      const stableHandlers = entries.map(([event, fn]) => {
        const stable = (...args) => fn(...args);
        socket.on(event, stable);
        return [event, stable];
      });
      return () => stableHandlers.forEach(([event, fn]) => socket.off(event, fn));
    } else {
      const stable = (...args) => handlerRef.current(...args);
      socket.on(eventOrMap, stable);
      return () => socket.off(eventOrMap, stable);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, ...(typeof eventOrMap === 'string' ? [eventOrMap] : []), ...deps]);
}

/**
 * Returns a stable emitter function that won't change between renders.
 *
 * Usage:
 *   const emit = useSocketEmit();
 *   emit('room:join', { roomId });
 */
export function useSocketEmit() {
  const { socket } = useSocket();
  return useCallback((event, ...args) => {
    if (socket?.connected) socket.emit(event, ...args);
  }, [socket]);
}