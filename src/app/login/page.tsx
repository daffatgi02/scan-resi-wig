// src/app/login/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import styles from './login.module.css';
import Image from 'next/image';
import logoImg from '@/assets/Logo WIG.png';
import loginBgImg from '@/assets/login.png';
import {
    UserIcon,
    LockPasswordIcon,
    Login03Icon,
    Loading03Icon,
    Alert01Icon,
    ViewIcon,
    ViewOffIcon,
    CheckmarkCircle02Icon
} from 'hugeicons-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, loading: authLoading, login } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && user) {
            if (user.role === 'SUPER_ADMIN') router.push('/superadmin');
            else if (user.role === 'ADMIN') router.push('/admin');
            else if (user.role === 'WAREHOUSE') router.push('/warehouse');
        }
    }, [user, authLoading, router]);

    const { success, error: toastError } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(username, password, rememberMe);
            if (!result.success) {
                const msg = result.error || 'Username atau password salah';
                setError(msg);
                toastError(msg, 'Gagal Masuk');
                setLoading(false);
            } else {
                success('Selamat datang kembali!', 'Login Berhasil');
            }
        } catch (e) {
            toastError('Terjadi kesalahan pada server', 'Kesalahan Sistem');
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="flex flex-col items-center">
                    <Loading03Icon size={48} className="animate-spin text-[#800000]" />
                    <p className="mt-4 text-gray-500 font-medium">Menautkan Sesi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.loginContainer}>
            {/* Left Panel: Form Side */}
            <div className={styles.leftPanel}>
                <div className={styles.formBox}>
                    <div className={styles.logoSection}>
                        <Image
                            src={logoImg}
                            alt="Logo PT Wijaya Inovasi Gemilang"
                            width={110}
                            height={110}
                            priority
                            className={styles.logoImage}
                        />
                    </div>

                    <div className={styles.headerSection}>
                        <h1 className={styles.title}>Masuk ke Akun Anda</h1>
                        <p className={styles.subtitle}>Selamat datang kembali! Silakan masukkan detail Anda.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className={styles.errorBox}>
                                <Alert01Icon size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Username</label>
                            <div className={styles.inputWrapper}>
                                <UserIcon size={20} className={styles.inputIcon} />
                                <input
                                    type="text"
                                    placeholder="Masukkan username Anda"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className={styles.mainInput}
                                    autoComplete="username"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.inputLabel}>Password</label>
                            <div className={styles.inputWrapper}>
                                <LockPasswordIcon size={20} className={styles.inputIcon} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Masukkan password Anda"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={styles.mainInput}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={styles.togglePass}
                                >
                                    {showPassword ? <ViewOffIcon size={20} /> : <ViewIcon size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.formFooter}>
                            <label className={styles.rememberMe}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className={styles.checkbox}
                                />
                                <span>Ingat saya</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading || !username || !password}
                        >
                            {loading ? (
                                <>
                                    <Loading03Icon size={20} className="animate-spin" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <span>Masuk</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Panel: Branding Side */}
            <div className={styles.rightPanel}>
                <div
                    className={styles.rightPanelBackground}
                    style={{ backgroundImage: `url(${loginBgImg.src})` }}
                />
                <div className={styles.rightPanelOverlay} />
            </div>
        </div>
    );
}
