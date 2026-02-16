// src/app/warehouse/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FolderOpenIcon,
    Loading03Icon,
    PackageIcon,
    ArrowRight01Icon,
    ArrowLeft01Icon,
    Tick02Icon,
    Calendar01Icon,
    FileDownloadIcon,
    Add01Icon
} from 'hugeicons-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { StatsOverview } from '@/components/Warehouse/StatsOverview';
import { RecentActivity } from '@/components/Warehouse/RecentActivity';
import { PdfReportGenerator } from '@/lib/pdfReport';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface Session {
    id: string;
    name: string;
    createdAt: string;
    isActive: boolean;
    _count: { items: number };
    scannedCount: number;
}

export default function WarehousePage() {
    const { user: authUser } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchingData, setFetchingData] = useState(true);
    const router = useRouter();

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [sessionsRes, statsRes, historyRes] = await Promise.all([
                fetch('/api/sessions'),
                fetch('/api/warehouse/stats'),
                fetch('/api/warehouse/history')
            ]);

            if (sessionsRes.ok) {
                const data = await sessionsRes.json();
                setSessions(data.filter((s: Session) => s.isActive));
            }
            if (statsRes.ok) setStats(await statsRes.json());
            if (historyRes.ok) setActivities(await historyRes.json());

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
            setFetchingData(false);
        }
    };

    const handleExportPDF = () => {
        if (!stats) return;
        PdfReportGenerator.generateDailyReport(stats, activities);
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentSessions = sessions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sessions.length / itemsPerPage);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loading03Icon size={48} className="animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground font-semibold uppercase tracking-widest text-xs">Menyiapkan Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1800px] mx-auto p-4 md:p-10 space-y-10">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-sm border border-primary/5 flex-shrink-0">
                        <FolderOpenIcon size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-primary/90">Warehouse Dashboard</h1>
                        <p className="text-[10px] md:text-xs font-black text-muted-foreground/60 uppercase tracking-[0.3em]">Pusat Kendali Operasional Wijaya</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="outline"
                        size="default"
                        className="flex-1 md:flex-none flex items-center gap-2 bg-white/80 backdrop-blur-sm border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 font-bold px-6"
                        onClick={handleExportPDF}
                        disabled={!stats}
                    >
                        <FileDownloadIcon size={18} />
                        <span className="md:inline">Export operational Report</span>
                    </Button>
                    {authUser?.role === 'SUPER_ADMIN' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push('/superadmin')}
                            className="rounded-full bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 h-10 w-10 transition-transform hover:scale-110 flex-shrink-0"
                            title="Ke Dashboard Utama"
                        >
                            <ArrowLeft01Icon size={18} />
                        </Button>
                    )}
                </div>
            </header>

            <StatsOverview stats={stats} loading={fetchingData} />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
                {/* Active Sessions - 3 Cols on wide screens */}
                <div className="xl:col-span-3 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="font-black text-sm uppercase tracking-[0.3em] text-primary/50 flex items-center gap-2">
                            <PackageIcon size={20} className="text-primary/40" />
                            Sesi Scan Aktif ({sessions.length})
                        </h2>
                    </div>

                    {sessions.length === 0 ? (
                        <Card className="border-none shadow-sm bg-muted/10 py-20">
                            <CardContent className="flex flex-col items-center justify-center text-center space-y-6">
                                <div className="p-12 bg-white shadow-inner rounded-full text-muted-foreground/10 border border-gray-50">
                                    <PackageIcon size={64} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-gray-400">Tidak Ada Sesi Aktif</h2>
                                    <p className="text-sm text-muted-foreground/60 font-medium">Belum ada antrian pemindaian yang aktif saat ini.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                                {currentSessions.map((session) => {
                                    const total = session._count?.items || 0;
                                    const scanned = session.scannedCount || 0;
                                    const progress = total > 0 ? Math.round((scanned / total) * 100) : 0;

                                    return (
                                        <Card
                                            key={session.id}
                                            className="group cursor-pointer border-none shadow-sm hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] bg-white overflow-hidden border-l-[6px] border-l-primary/10 hover:border-l-primary rounded-2xl"
                                            onClick={() => router.push(`/warehouse/scan/${session.id}`)}
                                        >
                                            <CardContent className="p-7">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="space-y-2 overflow-hidden flex-1">
                                                        <h3 className="font-black text-xl leading-tight group-hover:text-primary transition-colors truncate pr-2 tracking-tight">{session.name}</h3>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="text-[10px] font-black uppercase text-muted-foreground/70 bg-gray-50 px-3 py-1 rounded-full border border-gray-100 flex items-center gap-1">
                                                                <PackageIcon size={12} /> {total} Item
                                                            </span>
                                                            <span className="text-[10px] font-black uppercase text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100/50 flex items-center gap-1">
                                                                <Tick02Icon size={12} /> {scanned} Sukses
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-500 text-gray-400">
                                                        <ArrowRight01Icon size={22} />
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[10px] font-black uppercase text-primary/30 tracking-[0.2em]">Operational Progress</span>
                                                        <span className="text-lg font-black text-primary tracking-tighter">{progress}%</span>
                                                    </div>
                                                    <div className="h-2.5 w-full bg-primary/5 rounded-full overflow-hidden p-[1px] border border-primary/5">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <Pagination className="justify-center">
                                    <PaginationContent className="bg-white/80 backdrop-blur-sm p-1 rounded-full shadow-sm border border-gray-100">
                                        <PaginationItem>
                                            <PaginationPrevious
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                className={cn("cursor-pointer hover:bg-primary/5 rounded-full", currentPage === 1 && "pointer-events-none opacity-50")}
                                            />
                                        </PaginationItem>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <PaginationItem key={i}>
                                                <PaginationLink
                                                    onClick={() => setCurrentPage(i + 1)}
                                                    isActive={currentPage === i + 1}
                                                    className={cn(
                                                        "cursor-pointer rounded-full h-9 w-9 p-0 flex items-center justify-center font-bold text-sm transition-all duration-300",
                                                        currentPage === i + 1 ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" : "hover:bg-primary/5 text-muted-foreground"
                                                    )}
                                                >
                                                    {i + 1}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        <PaginationItem>
                                            <PaginationNext
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                className={cn("cursor-pointer hover:bg-primary/5 rounded-full", currentPage === totalPages && "pointer-events-none opacity-50")}
                                            />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column - Activity Feed (1 Col) */}
                <div className="xl:col-span-1">
                    <RecentActivity activities={activities} loading={fetchingData} />
                </div>
            </div>
        </div>
    );
}
