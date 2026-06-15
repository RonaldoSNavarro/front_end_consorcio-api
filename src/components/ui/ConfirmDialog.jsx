import React, { useEffect } from 'react';

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "primary" // danger, warning, primary
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'btn btn-danger';
      case 'warning':
        return 'btn btn-warning';
      case 'primary':
      default:
        return 'btn btn-primary';
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" style={{ zIndex: 1000 }} onClick={onCancel}>
      <div 
        className="modal-card glass-panel animate-scale-up" 
        style={{ 
          maxWidth: '450px', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '2rem' }}>
            {type === 'danger' ? '⚠️' : type === 'warning' ? '⚡' : 'ℹ️'}
          </span>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
            <p style={{ marginTop: '10px', color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {message}
            </p>
          </div>
        </div>
        
        <div className="modal-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' }}>
          <button 
            type="button" 
            className="btn btn-outline" 
            onClick={onCancel}
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            className={getConfirmButtonClass()} 
            onClick={onConfirm}
            style={{ padding: '8px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
