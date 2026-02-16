// src/app/superadmin/logs/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
    DocumentValidationIcon,
    Search01Icon,
    FilterHorizontalIcon,
    Download01Icon,
    Loading03Icon,
    RefreshIcon,
    ArrowLeft01Icon,
    ArrowRight01Icon
} from 'hugeicons-react';
import * as XLSX from 'xlsx';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';

interface ActivityLog {
    id: string;
    userId: string;
    user: { username: string; name: string };
    action: string;
    details: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

const actionLabels: Record<string, { label: string; color: string }> = {
    LOGIN: { label: 'Login', color: 'bg-blue-100 text-blue-700' },
    LOGOUT: { label: 'Logout', color: 'bg-orange-100 text-orange-700' },
    CREATE_SESSION: { label: 'Buat Sesi', color: 'bg-green-100 text-green-700' },
    UPLOAD_EXCEL: { label: 'Upload Excel', color: 'bg-green-100 text-green-700' },
    SCAN_ITEM: { label: 'Scan Paket', color: 'bg-blue-100 text-blue-700' },
    CREATE_USER: { label: 'Buat User', color: 'bg-green-100 text-green-700' },
    UPDATE_USER: { label: 'Update User', color: 'bg-orange-100 text-orange-700' },
    DEACTIVATE_USER: { label: 'Nonaktifkan User', color: 'bg-red-100 text-red-700' }
};

export default function LogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0); // 0-indexed for API
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(false);
    const limit = 20;

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(fetchLogs, 10000);
        }
        return () => clearInterval(interval);
    }, [autoRefresh, page, actionFilter]);

    const fetchLogs = async () => {
        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: (page * limit).toString()
            });
            if (actionFilter) params.append('action', actionFilter);

            const res = await fetch(`/api/logs?${params}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data.logs);
                setTotal(data.total);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            log.user?.name?.toLowerCase().includes(query) ||
            log.user?.username?.toLowerCase().includes(query) ||
            log.action.toLowerCase().includes(query) ||
            log.ipAddress?.toLowerCase().includes(query)
        );
    });

    const exportToExcel = () => {
        const data = logs.map(log => ({
            'Waktu': new Date(log.createdAt).toLocaleString('id-ID'),
            'User': log.user?.name,
            'Username': log.user?.username,
            'Aksi': log.action,
            'Detail': log.details ? JSON.stringify(JSON.parse(log.details)) : '-',
            'IP Address': log.ipAddress || '-',
            'User Agent': log.userAgent || '-'
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Activity Logs');
        XLSX.writeFile(wb, `Activity_Logs_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const totalPages = Math.ceil(total / limit);

    if (loading && logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <Loading03Icon size={48} className="animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Memuat log aktivitas...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/superadmin">
                        <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                            <ArrowLeft01Icon size={18} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
                        <p className="text-muted-foreground">Audit trail semua aktivitas sistem</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={cn("bg-background", autoRefresh && "text-primary border-primary")}
                    >
                        <RefreshIcon size={18} className={cn("mr-2", autoRefresh && "animate-spin")} />
                        {autoRefresh ? 'Auto ON' : 'Auto-Refresh'}
                    </Button>
                    <Button onClick={exportToExcel}>
                        <Download01Icon size={18} className="mr-2" />
                        Export Excel
                    </Button>
                </div>
            </header>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search01Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Cari user, aksi, IP..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10"
                        />
                    </div>
                    <div className="w-full md:w-[200px]">
                        <div className="relative">
                            <FilterHorizontalIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <select
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 appearance-none"
                                value={actionFilter}
                                onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
                            >
                                <option value="">Semua Aksi</option>
                                <option value="LOGIN">Login</option>
                                <option value="LOGOUT">Logout</option>
                                <option value="CREATE_SESSION">Buat Sesi</option>
                                <option value="SCAN_ITEM">Scan Paket</option>
                                <option value="CREATE_USER">Buat User</option>
                                <option value="UPDATE_USER">Update User</option>
                                <option value="DEACTIVATE_USER">Nonaktifkan User</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Waktu</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Aksi</TableHead>
                                <TableHead>Detail</TableHead>
                                <TableHead>IP Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        Tidak ada log yang ditemukan
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs.map((log) => {
                                    const actionInfo = actionLabels[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-700' };
                                    let details = '-';
                                    try {
                                        if (log.details) {
                                            const parsed = JSON.parse(log.details);
                                            details = Object.entries(parsed)
                                                .map(([k, v]) => `${k}: ${v}`)
                                                .join(', ');
                                        }
                                    } catch {
                                        details = log.details || '-';
                                    }

                                    return (
                                        <TableRow key={log.id}>
                                            <TableCell className="whitespace-nowrap font-medium text-xs text-muted-foreground">
                                                {new Date(log.createdAt).toLocaleString('id-ID', {
                                                    dateStyle: 'short',
                                                    timeStyle: 'medium'
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-semibold">{log.user?.name}</div>
                                                <div className="text-xs text-muted-foreground">@{log.user?.username}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", actionInfo.color)}>
                                                    {actionInfo.label}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[250px] truncate text-xs text-muted-foreground">
                                                {details}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {log.ipAddress || '-'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination Component */}
            {totalPages > 1 && (
                <div className="py-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setPage(p => Math.max(0, p - 1)); }}
                                    className={page === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()}>
                                    {page + 1}
                                </PaginationLink>
                            </PaginationItem>

                            {totalPages > 1 && (
                                <PaginationItem>
                                    <span className="text-muted-foreground text-sm mx-2">
                                        dari {totalPages}
                                    </span>
                                </PaginationItem>
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages - 1, p + 1)); }}
                                    className={page >= totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
