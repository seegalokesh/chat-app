import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import api from '../../utils/api';

/**
 * A single user row — used in the room member list and any user search results.
 *
 * Props:
 *   user        — { id, username, avatar, status }
 *   showStatus  — boolean (default true)
 *   onClick     — optional override; if omitted, clicking starts a DM
 */
export default function UserItem({ user: targetUser, showStatus = true, onClick }) {
  const { user: me } = useAuth();
  const { setConversations, setActiveChat, onlineUsers } = useChat();

  const isOnline = onlineUsers[targetUser.id] || targetUser.status === 'online';
  const isMe = targetUser.id === me?.id;

  const handleClick = async () => {
    if (onClick) { onClick(targetUser); return; }
    if (isMe) return; // Can't DM yourself

    const { data: conv } = await api.post(`/conversations/${targetUser.id}`);
    setConversations(prev =>
      prev.find(c => c.id === conv.id) ? prev : [conv, ...prev]
    );
    setActiveChat({ type: 'conv', id: conv.id, name: targetUser.username });
  };

  return (
    <button
      className={`user-item-btn ${isMe ? 'user-item-btn--me' : ''}`}
      onClick={handleClick}
      disabled={isMe}
      title={isMe ? 'You' : `Message ${targetUser.username}`}
    >
      <div className="user-item-avatar">
        <Avatar username={targetUser.username} avatar={targetUser.avatar} size={32} />
        {showStatus && (
          <span
            className={`user-item-status ${isOnline ? 'online' : 'offline'}`}
            aria-label={isOnline ? 'Online' : 'Offline'}
          />
        )}
      </div>

      <div className="user-item-info">
        <span className="user-item-name">
          {targetUser.username}
          {isMe && <span className="user-item-you"> (you)</span>}
        </span>
        {showStatus && (
          <span className="user-item-status-text">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        )}
      </div>

      {targetUser.role && (
        <Badge variant="info" size="sm">{targetUser.role}</Badge>
      )}
    </button>
  );
}