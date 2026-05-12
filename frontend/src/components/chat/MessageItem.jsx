import { useState } from 'react';
import { markdownComponents, remarkPlugins, processMentions, isSingleEmoji } from '../../utils/markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useChat } from '../../contexts/ChatContext';
import Avatar from '../ui/Avatar';

export default function MessageItem({ message }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { activeChat } = useChat();
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isOwn = message.sender_id === user.id;

  const handleEdit = (e) => {
    e.preventDefault();
    socket.emit('message:edit', { messageId: message.id, content: editContent });
    setEditing(false);
  };

  const handleDelete = () => {
    if (!confirm('Delete this message?')) return;
    socket.emit('message:delete', {
      messageId: message.id,
      roomId: activeChat.type === 'room' ? activeChat.id : undefined,
      convId: activeChat.type === 'conv' ? activeChat.id : undefined
    });
  };

  return (
    <div className={`message-item ${isOwn ? 'own' : ''}`}>
      <Avatar username={message.sender_username} avatar={message.sender_avatar} size={36} />
      <div className="message-body">
        <div className="message-meta">
          <span className="message-author">{message.sender_username}</span>
          <span className="message-time">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          {message.is_edited ? <span className="message-edited">(edited)</span> : null}
        </div>

        {editing ? (
          <form onSubmit={handleEdit} className="edit-form">
            <input
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-sm btn-primary">Save</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
          </form>
        ) : (
          <div className="message-content">
            {message.is_deleted ? (
              <em className="deleted-message">This message was deleted</em>
            ) : (
                <ReactMarkdown
                  remarkPlugins={remarkPlugins}
                  components={markdownComponents}
                >
                {processMentions(message.content)}
                </ReactMarkdown>
              
            )}
          </div>
        )}
      </div>

      {isOwn && !message.is_deleted && (
        <div className="message-actions">
          <button className="action-btn" onClick={() => setEditing(true)} title="Edit">✏️</button>
          <button className="action-btn" onClick={handleDelete} title="Delete">🗑️</button>
        </div>
      )}
    </div>
  );
}