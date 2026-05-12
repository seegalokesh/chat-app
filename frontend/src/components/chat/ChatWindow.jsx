import Header from '../layout/Header';
import { useChat } from '../../contexts/ChatContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UserList from '../users/UserList';

export default function ChatWindow() {
  const { activeChat } = useChat();

  if (!activeChat) {
    return (
      <div className="chat-empty">
        <p>Select a room or start a conversation</p>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <Header />
      <div className="chat-body">
        <div className="chat-messages-panel">
          <MessageList />
          <MessageInput />
        </div>
        {activeChat.type === 'room' && <UserList />}
    </div>
    </div>
  );
}