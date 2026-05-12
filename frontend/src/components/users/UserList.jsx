import { useEffect, useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import api from '../../utils/api';
import Avatar from '../ui/Avatar';

export default function UserList() {
  const { activeChat, onlineUsers } = useChat();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!activeChat || activeChat.type !== 'room') return;
    api.get(`/rooms/${activeChat.id}`)
      .then(r => setMembers(r.data.members));
  }, [activeChat]);

  return (
    <div className="user-list">
      <div className="user-list-title">Members — {members.length}</div>
      {members.map(m => (
        <div key={m.id} className="user-item">
          <Avatar username={m.username} avatar={m.avatar} size={28} />
          <span className="user-name">{m.username}</span>
          <span className={`status-dot ${onlineUsers[m.id] ? 'online' : 'offline'}`} />
        </div>
      ))}
    </div>
  );
}