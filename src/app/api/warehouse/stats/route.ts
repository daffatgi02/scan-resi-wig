// src/app/api/warehouse/stats/route.ts
import { NextResponse } from 'next/server';
import { SessionService } from '@/services/sessionService';
import { getErrorMessage } from '@/lib/utils';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stats = await SessionService.getDashboardStats();
        return NextResponse.json(stats);
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 }
        );
    }
}
