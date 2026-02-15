// src/components/Warehouse/RecentActivity.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Time01Icon, CheckmarkCircle02Icon } from 'hugeicons-react';
import { cn } from '@/lib/utils';

interface Activity {
    id: string;
    trackingId: string;
    productName: string;
    scannedAt: string;
    session: { name: string };
    scannedBy: { name: string } | null;
}

interface RecentActivityProps {
    activities: Activity[];
    loading: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities, loading }) => {
    if (loading) {
        return (
            <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4 animate-pulse">
                                <div className="h-10 w-10 bg-gray-100 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-100 rounded w-1/4" />
                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
            <CardContent className="p-0">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-black text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                        <Time01Icon size={18} />
                        Aktivitas Terbaru
                    </h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {activities.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm font-medium">
                            Belum ada aktivitas scan hari ini.
                        </div>
                    ) : (
                        activities.map((item) => (
                            <div key={item.id} className="p-4 flex items-start gap-4 hover:bg-white/50 transition-colors">
                                <div className="p-2 bg-green-50 text-green-600 rounded-full mt-1">
                                    <CheckmarkCircle02Icon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="font-bold text-sm truncate">{item.trackingId}</p>
                                        <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap bg-gray-100 px-2 py-0.5 rounded-full">
                                            {new Date(item.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate font-medium">
                                        {item.productName || 'Tanpa Nama Produk'}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-tight">
                                        <span className="text-primary/70">{item.session.name}</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-gray-500">{item.scannedBy?.name || 'Operator'}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
