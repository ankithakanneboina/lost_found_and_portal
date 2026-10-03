import React, { createContext, useContext, useState, useEffect } from 'react';
import { onMatchNotification } from '../services/socket';
import { useAuth } from './AuthContext';

const NotifContext = createContext(null);

export const NotifProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const cleanup = onMatchNotification((notif) => {
      setNotifications((prev) => [{ ...notif, read: false, id: Date.now() }, ...prev].slice(0, 50));
      setUnreadCount((c) => c + 1);
    });
    return cleanup;
  }, [user]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, markAllRead, clearAll }}>
      {children}
    </NotifContext.Provider>
  );
};

export const useNotifs = () => useContext(NotifContext);
