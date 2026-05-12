import { useChat } from '../../contexts/ChatContext';

export default function RoomList({ rooms, onSelect }) {
  const { activeChat } = useChat();

  return (
    <div className="room-list">
      {rooms.map(room => (
        <button
          key={room.id}
          className={`room-item ${activeChat?.id === room.id ? 'active' : ''}`}
          onClick={() => onSelect({ type: 'room', id: room.id, name: room.name })}
        >
          <span className="room-hash">#</span>
          <span className="room-name">{room.name}</span>
          {room.member_count && (
            <span className="room-count">{room.member_count}</span>
          )}
        </button>
      ))}
    </div>
  );
}