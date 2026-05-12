import { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useUI } from '../../contexts/UIContext';
import api from '../../utils/api';
import Modal from '../ui/Modal';

export default function CreateRoom() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const { setRooms, setActiveChat } = useChat();
  const { closeModal, addNotification } = useUI();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data: room } = await api.post('/rooms', { name, description });
      setRooms(prev => [...prev, room]);
      setActiveChat({ type: 'room', id: room.id, name: room.name });
      addNotification(`Room #${room.name} created!`, 'success');
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room');
    }
  };

  return (
    <Modal title="Create a room" onClose={closeModal}>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}
        <div className="form-group">
          <label>Room name</label>
          <input
            type="text" placeholder="e.g. general"
            value={name} onChange={e => setName(e.target.value)} required
          />
        </div>
        <div className="form-group">
          <label>Description (optional)</label>
          <input
            type="text" placeholder="What's this room about?"
            value={description} onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
          <button type="submit" className="btn btn-primary">Create</button>
        </div>
      </form>
    </Modal>
  );
}