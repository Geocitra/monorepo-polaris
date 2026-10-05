'use client';

import * as React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: (msg: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

// Listener singleton agar fungsi toast() dapat dipanggil dari mana saja (hook maupun file utilitas)
let globalToastEmitter: ((msg: Omit<ToastMessage, 'id'>) => void) | null = null;

export function toast(msg: Omit<ToastMessage, 'id'>) {
  if (globalToastEmitter) {
    globalToastEmitter(msg);
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const showToast = React.useCallback((msg: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...msg, id }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  React.useEffect(() => {
    globalToastEmitter = showToast;
    return () => {
      globalToastEmitter = null;
    };
  }, [showToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg bg-white dark:bg-slate-900 animate-in slide-in-from-bottom-5',
              t.type === 'success' && 'border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
              t.type === 'warning' && 'border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100',
              t.type === 'error' && 'border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
              t.type === 'info' && 'border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100'
            )}
          >
            {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />}
            {t.type === 'error' && <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />}

            <div className="flex-1">
              <h5 className="text-xs font-extrabold">{t.title}</h5>
              {t.description && <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{t.description}</p>}
            </div>

            <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast harus digunakan di dalam <ToastProvider>');
  }
  return context;
}
