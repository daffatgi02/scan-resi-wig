"use client";

import React, { useEffect, useState } from 'react';
import {
    CheckCircle2,
    AlertCircle,
    AlertTriangle,
    Info,
    X
} from 'lucide-react';
import styles from './Toast.module.css';
import { clsx } from 'clsx';

export type ToastType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';

export interface ToastProps {
    id: string;
    type: ToastType;
    title: string;
    message: string;
    duration?: number;
    onClose: (id: string) => void;
}

export default function Toast({
    id,
    type,
    title,
    message,
    duration = 5000,
    onClose
}: ToastProps) {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose(id);
        }, 300);
    };

    const icons = {
        SUCCESS: <CheckCircle2 size={20} />,
        ERROR: <AlertCircle size={20} />,
        WARNING: <AlertTriangle size={20} />,
        INFO: <Info size={20} />
    };

    const typeClasses = {
        SUCCESS: styles.success,
        ERROR: styles.error,
        WARNING: styles.warning,
        INFO: styles.info
    };

    return (
        <div className={clsx(
            styles.toast,
            typeClasses[type],
            isExiting && styles.toastExit
        )}>
            <div className={styles.toastIcon}>
                {icons[type]}
            </div>
            <div className={styles.toastContent}>
                <div className={styles.toastTitle}>{title}</div>
                <div className={styles.toastMessage}>{message}</div>
            </div>
            <button className={styles.closeButton} onClick={handleClose}>
                <X size={16} />
            </button>
            <div
                className={styles.progressBar}
                style={{ animation: `shrink ${duration}ms linear forwards` }}
            />
            <style jsx>{`
                @keyframes shrink {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }
            `}</style>
        </div>
    );
}
