/* eslint-disable react-refresh/only-export-components */
/**
 * ToastProvider - Système de notifications toast
 * Remplace les alert() par des notifications élégantes
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_TYPES = {
    success: { icon: CheckCircle, bg: 'bg-emerald-500', text: 'text-emerald-500' },
    error: { icon: XCircle, bg: 'bg-red-500', text: 'text-red-500' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-500', text: 'text-amber-500' },
    info: { icon: Info, bg: 'bg-blue-500', text: 'text-blue-500' }
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        warning: (msg) => addToast(msg, 'warning'),
        info: (msg) => addToast(msg, 'info')
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => {
                    const config = TOAST_TYPES[t.type];
                    const Icon = config.icon;

                    return (
                        <div
                            key={t.id}
                            className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 flex items-center gap-3 min-w-[280px] max-w-[400px] pointer-events-auto animate-[slideUp_0.3s_ease-out]"
                        >
                            <div className={`w-10 h-10 ${config.bg} rounded-full flex items-center justify-center shrink-0`}>
                                <Icon size={20} className="text-white" />
                            </div>
                            <p className="text-sm text-gray-700 font-medium flex-1">{t.message}</p>
                            <button
                                onClick={() => removeToast(t.id)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
