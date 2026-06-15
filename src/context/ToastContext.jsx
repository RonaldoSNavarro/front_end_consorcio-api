import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const triggerToast = useCallback((mensagem, tipo = 'info') => {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ triggerToast }}>
      {children}
      {toast && (
        <div className={`toast-alert toast-${toast.tipo}`}>
          <span>{toast.mensagem}</span>
        </div>
      )}
    </ToastContext.Provider>
  );
};
