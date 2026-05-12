import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useUI } from './contexts/UIContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Sidebar from './components/layout/Sidebar';
import ChatWindow from './components/chat/ChatWindow';
import CreateRoom from './components/rooms/CreateRoom';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-page"><p>Loading…</p></div>;
  return user ? children : <Navigate to="/login" />;
}

function ChatApp() {
  const { modal, closeModal, notifications } = useUI();

  return (
    <div className="app-layout">
      <Sidebar />
      <ChatWindow />
      {modal === 'createRoom' && <CreateRoom />}

      <div className="toast-container">
        {notifications.map(n => (
          <div key={n.id} className={`toast ${n.type}`}>{n.msg}</div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={
        <ProtectedRoute><ChatApp /></ProtectedRoute>
      } />
    </Routes>
  );
}