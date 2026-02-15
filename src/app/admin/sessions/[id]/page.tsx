// src/app/admin/sessions/[id]/page.tsx
"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
    ArrowLeft01Icon,
    PackageIcon,
    CheckmarkCircle01Icon,
    Alert01Icon,
    Download01Icon,
    File02Icon,
    FileAttachmentIcon,
    Loading03Icon,
    Refresh01Icon,
    Search01Icon,
    Tick02Icon
} from 'hugeicons-react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

interface SessionItem {
    id: string;
    trackingId: string;
    recipient: string;
    productName: string;
    status: string;
    scannedAt: string | null;
    scannedBy?: { name: string };
}

interface SessionDetail {
    id: string;
    name: string;
    createdAt: string;
    items: SessionItem[];
    stats: {
        total: number;
        scannedCount: number;
        missingCount: number;
        progress: number;
    };
}

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { user: authUser } = useAuth();
    const [session, setSession] = useState<SessionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'scanned' | 'unscanned'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchSession();
    }, [resolvedParams.id]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(fetchSession, 5000);
        }
        return () => clearInterval(interval);
    }, [autoRefresh, resolvedParams.id]);

    const fetchSession = async () => {
        try {
            const res = await fetch(`/api/sessions/${resolvedParams.id}/scan`);
            if (res.ok) {
                setSession(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch session:', error);
            toast.error("Gagal memuat detail sesi");
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = session?.items.filter(item => {
        const matchesFilter =
            filter === 'all' ||
            (filter === 'scanned' && item.status === 'SCANNED') ||
            (filter === 'unscanned' && item.status === 'UNSCANNED');

        const matchesSearch =
            !searchQuery ||
            item.trackingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.productName?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    }) || [];

    // Pagination logic
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const exportToExcel = () => {
        if (!session) return;
        try {
            const scanned = session.items.filter(i => i.status === 'SCANNED');
            const unscanned = session.items.filter(i => i.status === 'UNSCANNED');

            const wb = XLSX.utils.book_new();

            const scannedData = scanned.map(item => ({
                'Tracking ID': item.trackingId,
                'Penerima': item.recipient || '-',
                'Produk': item.productName || '-',
                'Waktu Scan': item.scannedAt ? new Date(item.scannedAt).toLocaleString('id-ID') : '-'
            }));
            const ws1 = XLSX.utils.json_to_sheet(scannedData);
            XLSX.utils.book_append_sheet(wb, ws1, 'Terkirim');

            const unscannedData = unscanned.map(item => ({
                'Tracking ID': item.trackingId,
                'Penerima': item.recipient || '-',
                'Produk': item.productName || '-'
            }));
            const ws2 = XLSX.utils.json_to_sheet(unscannedData);
            XLSX.utils.book_append_sheet(wb, ws2, 'Hilang-Tertinggal');

            XLSX.writeFile(wb, `Rekonsiliasi_${session.name}_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success('Laporan Excel berhasil diunduh');
        } catch (err) {
            toast.error('Gagal mengekspor Excel');
        }
    };

    const exportToPDF = () => {
        if (!session) return;
        try {
            const doc = new jsPDF();
            const scanned = session.items.filter(i => i.status === 'SCANNED');
            const unscanned = session.items.filter(i => i.status === 'UNSCANNED');

            doc.setFontSize(18);
            doc.text('Laporan Rekonsiliasi', 14, 22);
            doc.setFontSize(12);
            doc.text(`Sesi: ${session.name}`, 14, 32);
            doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 40);

            doc.setFontSize(10);
            doc.text(`Total: ${session.stats.total} | Terkirim: ${session.stats.scannedCount} | Tertinggal: ${session.stats.missingCount}`, 14, 50);

            doc.setFontSize(14);
            doc.text('Paket Terkirim (Scanned)', 14, 65);

            autoTable(doc, {
                startY: 70,
                head: [['No', 'Tracking ID', 'Penerima', 'Waktu Scan']],
                body: scanned.map((item, idx) => [
                    idx + 1,
                    item.trackingId,
                    item.recipient || '-',
                    item.scannedAt ? new Date(item.scannedAt).toLocaleString('id-ID') : '-'
                ]),
                headStyles: { fillColor: [34, 197, 94] },
                styles: { fontSize: 8 }
            });

            const finalY = (doc as any).lastAutoTable.finalY || 70;
            doc.setFontSize(14);
            doc.text('Paket Hilang/Tertinggal (Unscanned)', 14, finalY + 15);

            autoTable(doc, {
                startY: finalY + 20,
                head: [['No', 'Tracking ID', 'Penerima', 'Produk']],
                body: unscanned.map((item, idx) => [
                    idx + 1,
                    item.trackingId,
                    item.recipient || '-',
                    item.productName || '-'
                ]),
                headStyles: { fillColor: [239, 68, 68] },
                styles: { fontSize: 8 }
            });

            doc.save(`Rekonsiliasi_${session.name}_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('Laporan PDF berhasil diunduh');
        } catch (err) {
            toast.error('Gagal mengekspor PDF');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <Loading03Icon size={48} className="animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Memuat detail sesi...</p>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <Alert01Icon size={64} className="text-yellow-500 mb-4" />
                <p className="text-xl font-semibold">Sesi tidak ditemukan</p>
                <Link href="/admin/sessions" className="mt-6">
                    <Button>Kembali ke Daftar Sesi</Button>
                </Link>
            </div>
        );
    }

    const progress = Math.round(session.stats.progress);

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                    {authUser?.role === 'SUPER_ADMIN' ? (
                        <Link href="/superadmin">
                            <Button variant="outline" size="sm" className="gap-2">
                                <ArrowLeft01Icon size={16} /> Dashboard SuperAdmin
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/admin/sessions">
                            <Button variant="outline" size="sm" className="gap-2">
                                <ArrowLeft01Icon size={16} /> Daftar Sesi
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{session.name}</h1>
                        <p className="text-muted-foreground">
                            Dibuat {new Date(session.createdAt).toLocaleDateString('id-ID', {
                                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={autoRefresh ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className="gap-2"
                        >
                            <Refresh01Icon size={16} className={autoRefresh ? "animate-spin" : ""} />
                            {autoRefresh ? 'Refresh: ON' : 'Auto-Refresh'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportToExcel} className="gap-2">
                            <File02Icon size={16} className="text-green-600" /> Excel
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportToPDF} className="gap-2">
                            <FileAttachmentIcon size={16} className="text-red-600" /> PDF
                        </Button>
                    </div>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Paket</CardTitle>
                        <PackageIcon size={20} className="text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{session.stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Terkirim</CardTitle>
                        <CheckmarkCircle01Icon size={20} className="text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{session.stats.scannedCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tertinggal</CardTitle>
                        <Alert01Icon size={20} className="text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{session.stats.missingCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Progress</CardTitle>
                        <div className="text-sm font-bold text-primary">{progress}%</div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Package List */}
            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <CardTitle>Daftar Paket</CardTitle>
                        <div className="flex bg-secondary p-1 rounded-lg">
                            {(['all', 'scanned', 'unscanned'] as const).map(f => (
                                <button
                                    key={f}
                                    className={cn(
                                        "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                        filter === f ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                    )}
                                    onClick={() => { setFilter(f); setCurrentPage(1); }}
                                >
                                    {f === 'all' ? 'Semua' : f === 'scanned' ? 'Terkirim' : 'Tertinggal'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search01Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Cari tracking ID, penerima..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className="pl-10 h-10"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tracking ID</TableHead>
                                <TableHead>Penerima</TableHead>
                                <TableHead>Produk</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Waktu Scan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-48 text-muted-foreground">
                                        Tidak ada data yang sesuai filter
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedItems.map((item) => (
                                    <TableRow key={item.id} className="group">
                                        <TableCell className="font-bold">{item.trackingId}</TableCell>
                                        <TableCell>{item.recipient || '-'}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{item.productName || '-'}</TableCell>
                                        <TableCell>
                                            {item.status === 'SCANNED' ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                                                    <Tick02Icon size={12} className="text-green-700" /> Terkirim
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                                                    <Alert01Icon size={12} className="text-red-700" /> Tertinggal
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {item.scannedAt
                                                ? new Date(item.scannedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
                                                : '-'
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="py-2">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationLink href="#" isActive onClick={(e) => e.preventDefault()}>
                                    {currentPage}
                                </PaginationLink>
                            </PaginationItem>

                            <PaginationItem>
                                <span className="text-muted-foreground text-sm mx-2">dari {totalPages}</span>
                            </PaginationItem>

                            <PaginationItem>
                                <PaginationNext
                                    href="#"
                                    onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
