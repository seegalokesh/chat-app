import { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useUI } from '../../contexts/UIContext';
import { useAuth } from '../../contexts/AuthContext';
import RoomList from '../rooms/RoomList';
import api from '../../utils/api';

export default function Sidebar() {
  const { rooms, setRooms, conversations, setConversations, setActiveChat, onlineUsers } = useChat();
  const { openModal } = useUI();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState({ rooms: [], users: [] });
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' | 'dms'

  const handleSearch = async (q) => {
    setSearch(q);
    if (!q.trim()) { setSearchResults({ rooms: [], users: [] }); return; }
    const [r, u] = await Promise.all([
      api.get(`/rooms/search?q=${q}`),
      api.get(`/users?q=${q}`)
    ]);
    setSearchResults({ rooms: r.data, users: u.data });
  };

  const joinRoom = async (room) => {
    await api.post(`/rooms/${room.id}/join`);
    setRooms(prev => prev.find(r => r.id === room.id) ? prev : [...prev, room]);
    setActiveChat({ type: 'room', id: room.id, name: room.name });
    setSearch('');
  };

  const startDM = async (targetUser) => {
    const { data: conv } = await api.post(`/conversations/${targetUser.id}`);
    setConversations(prev => prev.find(c => c.id === conv.id) ? prev : [conv, ...prev]);
    setActiveChat({ type: 'conv', id: conv.id, name: targetUser.username });
    setSearch('');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">💬 ChatApp</span>
      </div>

      <div className="sidebar-search">
        <input
          type="search" placeholder="Search rooms & users…"
          value={search} onChange={e => handleSearch(e.target.value)}
        />
        {search && (
          <div className="search-results">
            {searchResults.rooms.length > 0 && (
              <>
                <div className="search-section-label">Rooms</div>
                {searchResults.rooms.map(r => (
                  <button key={r.id} className="search-item" onClick={() => joinRoom(r)}>
                    # {r.name}
                  </button>
                ))}
              </>
            )}
            {searchResults.users.length > 0 && (
              <>
                <div className="search-section-label">Users</div>
                {searchResults.users.filter(u => u.id !== user.id).map(u => (
                  <button key={u.id} className="search-item" onClick={() => startDM(u)}>
                    <span className={`status-dot ${onlineUsers[u.id] ? 'online' : 'offline'}`} />
                    {u.username}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="sidebar-tabs">
        <button className={activeTab === 'rooms' ? 'tab active' : 'tab'} onClick={() => setActiveTab('rooms')}>Rooms</button>
        <button className={activeTab === 'dms'   ? 'tab active' : 'tab'} onClick={() => setActiveTab('dms')}>Direct</button>
      </div>

      {activeTab === 'rooms' ? (
        <RoomList rooms={rooms} onSelect={setActiveChat} />
      ) : (
        <div className="dm-list">
          {conversations.map(conv => (
            <button
              key={conv.id}
              className="dm-item"
              onClick={() => setActiveChat({ type: 'conv', id: conv.id, name: conv.other_username })}
            >
              <span className={`status-dot ${onlineUsers[conv.other_user_id] ? 'online' : 'offline'}`} />
              <span className="dm-name">{conv.other_username}</span>
              {conv.last_message && (
                <span className="dm-preview">{conv.last_message}</span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="sidebar-footer">
        <button className="btn btn-sm" onClick={() => openModal('createRoom')}>+ New Room</button>
      </div>
    </aside>
  );
}