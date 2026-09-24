import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useProject();

  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="text-emerald-400" color="#10b981" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-400" color="#f59e0b" />;
      case 'error':
        return <AlertCircle size={18} className="text-rose-400" color="#ef4444" />;
      default:
        return <Info size={18} className="text-blue-400" color="#3b82f6" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div style={{ marginTop: 2 }}>{getIcon(toast.type)}</div>
          <div className="toast-content">
            <div className="toast-title">{toast.title}</div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="toast-close"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
