import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Zap, Info, X } from 'lucide-react';

const ICONS = {
  danger: AlertTriangle,
  warning: Zap,
  primary: Info,
};

const COLORS = {
  danger: {
    icon: 'text-rose-500',
    title: 'text-rose-500 dark:text-rose-400',
    btn: 'btn-danger',
  },
  warning: {
    icon: 'text-amber-500',
    title: 'text-amber-500 dark:text-amber-400',
    btn: 'btn-warning',
  },
  primary: {
    icon: 'text-blue-500',
    title: 'text-blue-600 dark:text-blue-400',
    btn: 'btn-primary',
  },
};

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "primary"
}) => {
  const confirmRef = useRef(null);
  const dialogRef = useRef(null);

  // Focus trap & Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }
      // Basic focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll('button');
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Auto-focus cancel button
    confirmRef.current?.focus();

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const color = COLORS[type] || COLORS.primary;
  const Icon = ICONS[type] || Info;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div 
        ref={dialogRef}
        className="w-full max-w-md mx-4 p-6 rounded-2xl animate-scale-up
                   bg-white dark:bg-slate-800 
                   border border-slate-200 dark:border-slate-700/60
                   shadow-2xl shadow-black/20"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
      >
        <div className="flex gap-4 items-start">
          <div className={`p-2.5 rounded-xl ${type === 'danger' ? 'bg-rose-50 dark:bg-rose-500/10' : type === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-blue-50 dark:bg-blue-500/10'}`}>
            <Icon className={`w-6 h-6 ${color.icon}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-title" className={`text-lg font-title font-bold ${color.title}`}>
              {title}
            </h3>
            <p id="confirm-desc" className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button 
            type="button" 
            className="btn btn-outline btn-sm"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            ref={confirmRef}
            type="button" 
            className={`btn btn-sm ${color.btn}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
