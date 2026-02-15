// src/app/admin/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    FolderOpenIcon,
    PackageIcon,
    CheckmarkCircle01Icon,
    Alert01Icon,
    Add01Icon,
    ArrowRight01Icon,
    ArrowLeft01Icon,
    Loading03Icon
} from 'hugeicons-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import type { SessionListItem } from '@/types/session';
import { getProgress } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface SessionStats {
    totalSessions: number;
    totalItems: number;
    scannedItems: number;
    unscannedItems: number;
}

export default function AdminDashboard() {
    const { user: authUser } = useAuth();
    const [stats, setStats] = useState<SessionStats>({
        totalSessions: 0,
        totalItems: 0,
        scannedItems: 0,
        unscannedItems: 0
    });
    const [recentSessions, setRecentSessions] = useState<SessionListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/sessions');
            if (res.ok) {
                const sessions: SessionListItem[] = await res.json();

                // Calculate stats
                let totalItems = 0;
                let scannedItems = 0;

                sessions.forEach((s) => {
                    totalItems += s._count?.items || 0;
                    scannedItems += s.scannedCount || 0;
                });

                setStats({
                    totalSessions: sessions.length,
                    totalItems,
                    scannedItems,
                    unscannedItems: totalItems - scannedItems
                });

                setRecentSessions(sessions.slice(0, 5));
            }
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
            <header className="flex items-center gap-4">
                {authUser?.role === 'SUPER_ADMIN' && (
                    <Link href="/superadmin">
                        <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                            <ArrowLeft01Icon size={18} />
                        </Button>
                    </Link>
                )}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Overview rekonsiliasi logistik</p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-100/50 text-blue-600">
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
                        <div className="p-3 rounded-xl bg-purple-100/50 text-purple-600">
                            <PackageIcon size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold font-mono">{stats.totalItems.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Paket</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-100/50 text-green-600">
                            <CheckmarkCircle01Icon size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold font-mono">{stats.scannedItems.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sudah Discan</div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-orange-100/50 text-orange-600">
                            <Alert01Icon size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold font-mono">{stats.unscannedItems.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Belum Discan</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Sessions */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xl font-bold">Sesi Terbaru</CardTitle>
                    <Link href="/admin/sessions">
                        <Button size="sm">
                            <Add01Icon size={18} className="mr-2" />
                            Buat Sesi Baru
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="p-0">
                    {recentSessions.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground">
                            <FolderOpenIcon size={48} className="mx-auto mb-4 opacity-20" />
                            <p>Belum ada sesi scanning</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Sesi</TableHead>
                                    <TableHead>Total Paket</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead className="text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentSessions.map((session) => {
                                    const total = session._count?.items || 0;
                                    const scanned = session.scannedCount || 0;
                                    const progress = getProgress(scanned, total);

                                    return (
                                        <TableRow key={session.id}>
                                            <TableCell className="font-semibold">{session.name}</TableCell>
                                            <TableCell className="font-mono">{total} paket</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary transition-all duration-500"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-muted-foreground w-8">{progress}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground font-mono">
                                                {new Date(session.createdAt).toLocaleDateString('id-ID')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/admin/sessions/${session.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        Detail <ArrowRight01Icon size={14} className="ml-2" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
