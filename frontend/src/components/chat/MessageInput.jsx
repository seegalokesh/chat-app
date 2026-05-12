import { useState, useRef, useCallback } from 'react';
import { useChat } from '../../contexts/ChatContext';

export default function MessageInput() {
  const [content, setContent] = useState('');
  const { sendMessage, sendTyping } = useChat();
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  const handleChange = useCallback((e) => {
    setContent(e.target.value);

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTyping(true);
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTyping(false);
    }, 2000);
  }, [sendTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    sendMessage(content);
    setContent('');
    // Stop typing
    clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;
    sendTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message… (Shift+Enter for new line, markdown supported)"
        rows={1}
      />
      <button type="submit" className="btn btn-primary send-btn" disabled={!content.trim()}>
        Send
      </button>
    </form>
  );
}