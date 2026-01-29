"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast, { ToastType } from '../components/Toast/Toast';
import styles from '../components/Toast/Toast.module.css';

interface ToastOptions {
    title?: string;
    duration?: number;
}

interface ToastContextType {
    showToast: (type: ToastType, message: string, options?: ToastOptions) => void;
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastItem {
    id: string;
    type: ToastType;
    title: string;
    message: string;
    duration?: number;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((type: ToastType, message: string, options?: ToastOptions) => {
        const id = Math.random().toString(36).substring(2, 9);
        const title = options?.title || (type === 'SUCCESS' ? 'Berhasil' : type === 'ERROR' ? 'Kesalahan' : type === 'WARNING' ? 'Peringatan' : 'Informasi');

        setToasts(prev => [...prev, {
            id,
            type,
            title,
            message,
            duration: options?.duration
        }]);
    }, []);

    const success = (message: string, title?: string) => showToast('SUCCESS', message, { title });
    const error = (message: string, title?: string) => showToast('ERROR', message, { title });
    const warning = (message: string, title?: string) => showToast('WARNING', message, { title });
    const info = (message: string, title?: string) => showToast('INFO', message, { title });

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}
            <div className={styles.toastContainer}>
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onClose={removeToast}
                    />
                ))}
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
