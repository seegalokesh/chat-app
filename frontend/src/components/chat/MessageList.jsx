import { useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';

export default function MessageList() {
  const { currentMessages, currentTyping } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, currentTyping]);

  return (
    <div className="message-list">
      {currentMessages.map(msg => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      <TypingIndicator typing={currentTyping} />
      <div ref={bottomRef} />
    </div>
  );
}