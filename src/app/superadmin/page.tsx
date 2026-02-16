// src/app/superadmin/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    UserGroupIcon,
    FolderOpenIcon,
    PackageIcon,
    Activity01Icon,
    ArrowRight01Icon,
    Loading03Icon,
    ArrowLeft02Icon,
    SecurityCheckIcon,
    Settings01Icon
} from 'hugeicons-react';
import { cn } from '@/lib/utils';
import type { SessionListItem } from '@/types/session';
import type { ActivityLog } from '@/types/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface DashboardStats {
    totalUsers: number;
    totalSessions: number;
    totalPackages: number;
    recentLogs: ActivityLog[];
}

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalSessions: 0,
        totalPackages: 0,
        recentLogs: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [usersRes, sessionsRes, logsRes] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/sessions'),
                fetch('/api/logs?limit=5')
            ]);

            const users = usersRes.ok ? await usersRes.json() : [];
            const sessions: SessionListItem[] = sessionsRes.ok ? await sessionsRes.json() : [];
            const logsData = logsRes.ok ? await logsRes.json() : { logs: [] };

            let totalPackages = 0;
            sessions.forEach((s) => {
                totalPackages += s._count?.items || 0;
            });

            setStats({
                totalUsers: users.length,
                totalSessions: sessions.length,
                totalPackages,
                recentLogs: logsData.logs || []
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <Loading03Icon size={48} className="animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Memuat dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header>
                <div className="flex items-center gap-2 mb-2">
                    <SecurityCheckIcon size={20} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">System Overview</span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Utama</h1>
                <p className="text-muted-foreground">Pusat Kontrol Sistem Pelacakan Paket</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-100/50 text-blue-600">
                            <UserGroupIcon size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold font-mono">{stats.totalUsers}</div>
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total User</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-100/50 text-purple-600">
                            <FolderOpenIcon size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold font-mono">{stats.totalSessions}</div>
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Sesi</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-100/50 text-green-600">
                            <PackageIcon size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold font-mono">{stats.totalPackages.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Paket</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-orange-100/50 text-orange-600">
                            <Activity01Icon size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold font-mono">{stats.recentLogs.length}</div>
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Aktivitas Terbaru</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/superadmin/users" className="block transform transition-all hover:scale-[1.01] active:scale-[0.99]">
                    <Card className="hover:border-primary/50 transition-colors">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
                                <UserGroupIcon size={32} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">User Management</h3>
                                <p className="text-sm text-muted-foreground">Tambah, edit, atau nonaktifkan user sistem</p>
                            </div>
                            <ArrowRight01Icon size={24} className="text-muted-foreground/30" />
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/superadmin/logs" className="block transform transition-all hover:scale-[1.01] active:scale-[0.99]">
                    <Card className="hover:border-orange-500/50 transition-colors">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="p-4 rounded-2xl bg-orange-50 text-orange-600">
                                <Activity01Icon size={32} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">Activity Logs</h3>
                                <p className="text-sm text-muted-foreground">Pantau semua aktivitas dan jejak audit sistem</p>
                            </div>
                            <ArrowRight01Icon size={24} className="text-muted-foreground/30" />
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xl font-bold">Aktivitas Terbaru</CardTitle>
                    <Link href="/superadmin/logs">
                        <Button variant="outline" size="sm">
                            Lihat Semua
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="p-0">
                    {stats.recentLogs.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground">
                            Belum ada aktivitas
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Waktu</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Aksi</TableHead>
                                    <TableHead>IP Address</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.recentLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-mono text-xs">
                                            {new Date(log.createdAt).toLocaleString('id-ID', {
                                                dateStyle: 'short',
                                                timeStyle: 'short'
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{log.user?.name}</span>
                                                <span className="text-[10px] text-muted-foreground font-mono">@{log.user?.username}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-secondary-foreground uppercase tracking-tight">
                                                {log.action}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground font-mono">
                                            {log.ipAddress || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
