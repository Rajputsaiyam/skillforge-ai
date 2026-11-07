import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [coldEmailLocked, setColdEmailLocked] = useState(() => {
    const saved = localStorage.getItem('sf_cold_email_locked');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleColdEmailLock = useCallback((value) => {
    setColdEmailLocked((prev) => {
      const nextVal = typeof value === 'boolean' ? value : !prev;
      localStorage.setItem('sf_cold_email_locked', String(nextVal));
      return nextVal;
    });
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <AppContext.Provider
      value={{
        toasts,
        showToast,
        sidebarCollapsed,
        setSidebarCollapsed,
        coldEmailLocked,
        setColdEmailLocked,
        toggleColdEmailLock,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
