import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-16 sm:bottom-6 right-6 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border text-sm animate-slide-in',
              toast.type === 'success' && 'bg-surface text-ink border-green-200 shadow-green-100/50',
              toast.type === 'error' && 'bg-surface text-ink border-red-200 shadow-red-100/50',
              toast.type === 'info' && 'bg-surface text-ink border-line'
            )}
          >
            <div className="flex items-center space-x-2.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-success shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-danger shrink-0" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-accent shrink-0" />}
              <span className="font-medium text-ink">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-mute hover:text-ink p-1 rounded-full ml-2"
              aria-label="Dismiss toast"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
