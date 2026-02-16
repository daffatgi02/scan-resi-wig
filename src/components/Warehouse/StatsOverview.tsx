// src/components/Warehouse/StatsOverview.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
    DashboardCircleIcon,
    CheckmarkCircle02Icon,
    PackageIcon,
    ArrowUpRight01Icon
} from 'hugeicons-react';
import { cn } from '@/lib/utils';

interface StatsOverviewProps {
    stats: {
        totalSessions: number;
        totalScannedToday: number;
        activeSessions: number;
        overallProgress: number;
    } | null;
    loading: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, loading }) => {
    const items = [
        {
            label: 'Sesi Hari Ini',
            value: stats?.totalSessions || 0,
            icon: DashboardCircleIcon,
            color: 'text-primary',
            bg: 'bg-primary/10'
        },
        {
            label: 'Terscan Hari Ini',
            value: stats?.totalScannedToday || 0,
            icon: CheckmarkCircle02Icon,
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
        {
            label: 'Sesi Aktif',
            value: stats?.activeSessions || 0,
            icon: PackageIcon,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Total Progress',
            value: `${stats?.overallProgress || 0}%`,
            icon: ArrowUpRight01Icon,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-none shadow-sm animate-pulse">
                        <CardContent className="p-4 bg-gray-50 h-24" />
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item, i) => (
                <Card key={i} className="border-none shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex flex-col gap-2">
                        <div className={cn("p-2 rounded-lg w-fit", item.bg, item.color)}>
                            <item.icon size={20} />
                        </div>
                        <div>
                            <div className="text-2xl font-black tracking-tight">{item.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">{item.label}</div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
