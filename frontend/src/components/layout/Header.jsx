import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useChat } from '../../contexts/ChatContext';
import Avatar from '../ui/Avatar';

export default function Header() {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const { activeChat } = useChat();

  return (
    <header className="app-header">
      {/* Left: current chat context */}
      <div className="header-title">
        {activeChat ? (
          <>
            <span className="header-chat-type">
              {activeChat.type === 'room' ? '#' : '👤'}
            </span>
            <span className="header-chat-name">{activeChat.name}</span>
          </>
        ) : (
          <span className="header-app-name">ChatApp</span>
        )}
      </div>

      {/* Right: connection status + user menu */}
      <div className="header-right">
        <span className={`connection-badge ${connected ? 'connected' : 'disconnected'}`}>
          <span className="connection-dot" />
          {connected ? 'Connected' : 'Reconnecting…'}
        </span>

        <div className="header-user">
          <Avatar username={user?.username} avatar={user?.avatar} size={30} />
          <span className="header-username">{user?.username}</span>
          <button className="btn-logout" onClick={logout} title="Sign out">
            ↩
          </button>
        </div>
      </div>
    </header>
  );
}