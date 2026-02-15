// src/app/admin/sessions/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    Add01Icon,
    File02Icon,
    ArrowRight01Icon,
    ArrowLeft01Icon,
    Loading03Icon,
    Upload01Icon,
    HddIcon,
    FolderOpenIcon,
    Delete02Icon,
    Cancel01Icon,
    Search01Icon
} from 'hugeicons-react';
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Session {
    id: string;
    name: string;
    createdAt: string;
    isActive: boolean;
    _count: { items: number };
    scannedCount: number;
    createdBy?: { name: string };
}

export default function SessionsPage() {
    const { user: authUser } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [sessionName, setSessionName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [creating, setCreating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Pagination & Search
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = 8;

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/sessions');
            if (res.ok) {
                setSessions(await res.json());
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
            toast.error("Gagal memuat sesi");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionName || !file) return;

        setCreating(true);
        const formData = new FormData();
        formData.append('name', sessionName);
        formData.append('file', file);

        try {
            const res = await fetch('/api/sessions', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const newSession = await res.json();
                setShowCreateModal(false);
                setSessionName('');
                setFile(null);
                fetchSessions();
                toast.success(`Sesi "${sessionName}" berhasil dibuat dengan ${newSession._count.items} paket.`);
            } else {
                const err = await res.json();
                toast.error(err.error || 'Gagal membuat sesi');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan pada server');
        } finally {
            setCreating(false);
        }
    };

    const getProgress = (scanned: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((scanned / total) * 100);
    };

    // Filter & Pagination Logic
    const filteredSessions = sessions.filter(session =>
        session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.createdBy?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
    const paginatedSessions = filteredSessions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <Loading03Icon size={48} className="animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Memuat sesi...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {authUser?.role === 'SUPER_ADMIN' && (
                        <Link href="/superadmin">
                            <Button variant="outline" size="icon" className="rounded-full">
                                <ArrowLeft01Icon size={18} />
                            </Button>
                        </Link>
                    )}
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Sesi Scanning</h1>
                        <p className="text-muted-foreground">Kelola sesi rekonsiliasi paket</p>
                    </div>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Add01Icon size={18} className="mr-2" />
                    Buat Sesi Baru
                </Button>
            </header>

            {/* Filters */}
            <div className="relative max-w-sm">
                <Search01Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Cari sesi..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="pl-10 h-10"
                />
            </div>

            {/* Sessions List */}
            <Card>
                <CardContent className="p-0">
                    {sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <FolderOpenIcon size={64} className="mb-6 opacity-20" />
                            <h3 className="text-lg font-semibold mb-2 text-foreground">Belum Ada Sesi</h3>
                            <p className="mb-6">Buat sesi baru untuk memulai scanning</p>
                            <Button onClick={() => setShowCreateModal(true)}>
                                <Add01Icon size={18} className="mr-2" />
                                Buat Sesi Pertama
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Sesi</TableHead>
                                    <TableHead>Total Paket</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead>Dibuat Oleh</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSessions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                            Tidak ada sesi yang ditemukan
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedSessions.map((session) => {
                                        const total = session._count?.items || 0;
                                        const scanned = session.scannedCount || 0;
                                        const progress = getProgress(scanned, total);

                                        return (
                                            <TableRow key={session.id}>
                                                <TableCell className="font-medium">
                                                    {session.name}
                                                </TableCell>
                                                <TableCell>{total} paket</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden w-24">
                                                            <div
                                                                className="h-full bg-primary transition-all duration-500"
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium text-muted-foreground w-8 text-right">{progress}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{session.createdBy?.name || '-'}</TableCell>
                                                <TableCell>{new Date(session.createdAt).toLocaleDateString('id-ID')}</TableCell>
                                                <TableCell>
                                                    {progress === 100 ? (
                                                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Selesai</span>
                                                    ) : session.isActive ? (
                                                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Aktif</span>
                                                    ) : (
                                                        <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">Nonaktif</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/admin/sessions/${session.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-8">
                                                            Detail <ArrowRight01Icon size={14} className="ml-2" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    )}
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

            {/* Create Session Dialog */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Buat Sesi Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSession} className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Nama Sesi</label>
                            <Input
                                placeholder="Contoh: Sesi Pickup Siang"
                                value={sessionName}
                                onChange={(e) => setSessionName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">File Excel Manifest</label>
                            <div
                                className={cn(
                                    "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-secondary/50",
                                    file ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                                )}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    className="hidden"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <File02Icon size={40} className={cn("mb-2", file ? "text-primary" : "text-muted-foreground")} />
                                <div className="text-sm font-medium text-center">
                                    {file ? file.name : 'Klik untuk upload file Excel'}
                                </div>
                                <div className="text-xs text-muted-foreground text-center mt-1">
                                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Format: .xlsx, .xls'}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={creating || !sessionName || !file}>
                                {creating ? (
                                    <>
                                        <Loading03Icon size={16} className="animate-spin mr-2" />
                                        Membuat...
                                    </>
                                ) : (
                                    <>
                                        <Upload01Icon size={16} className="mr-2" />
                                        Buat & Import
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
