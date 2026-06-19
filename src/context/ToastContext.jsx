import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const triggerToast = useCallback((mensagem, tipo = 'info') => {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  const Icon = toast ? ICONS[toast.tipo] || Info : null;

  return (
    <ToastContext.Provider value={{ triggerToast }}>
      {children}
      {toast && (
        <div className={`toast-alert toast-${toast.tipo}`} role="alert">
          {Icon && <Icon className="w-5 h-5 shrink-0" />}
          <span className="flex-1">{toast.mensagem}</span>
          <button
            onClick={dismiss}
            className="shrink-0 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Fechar notificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
};
