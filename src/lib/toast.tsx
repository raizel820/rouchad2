'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// Global singleton to ensure toast and container share the same state
// even across different webpack module instances
const TOAST_KEY = '__rare_beauty_toasts__';

function getListeners(): Array<(toast: Toast) => void> {
  if (!(globalThis as Record<string, unknown>)[TOAST_KEY]) {
    (globalThis as Record<string, unknown>)[TOAST_KEY] = [];
  }
  return (globalThis as Record<string, unknown>)[TOAST_KEY] as Array<(toast: Toast) => void>;
}

let _toastId = 0;
export function toast(message: string, type: ToastType = 'success') {
  const t: Toast = { id: ++_toastId, message, type };
  getListeners().forEach((fn) => fn(t));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Toast) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, 4000);
  }, []);

  useEffect(() => {
    const listeners = getListeners();
    listeners.push(addToast);
    return () => {
      const idx = listeners.indexOf(addToast);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, [addToast]);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} className="text-emerald-500 shrink-0" />;
      case 'error': return <AlertCircle size={18} className="text-red-500 shrink-0" />;
      case 'info': return <Info size={18} className="text-blue-500 shrink-0" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'border-l-emerald-500';
      case 'error': return 'border-l-red-500';
      case 'info': return 'border-l-blue-500';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`pointer-events-auto bg-white rounded-xl shadow-lg border border-gray-100 border-l-4 ${getBorderColor(t.type)} px-4 py-3 flex items-start gap-3`}
          >
            <div className="mt-0.5">{getIcon(t.type)}</div>
            <p className="text-sm text-gray-700 flex-1">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="mt-0.5 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
