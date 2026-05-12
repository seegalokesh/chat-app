import { createContext, useContext, useState } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [modal, setModal] = useState(null); // null | 'createRoom' | 'startDM'
  const [notifications, setNotifications] = useState([]);

  const openModal  = (name) => setModal(name);
  const closeModal = () => setModal(null);

  const addNotification = (msg, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => removeNotification(id), 4000);
  };

  const removeNotification = (id) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <UIContext.Provider value={{ modal, openModal, closeModal, notifications, addNotification }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);