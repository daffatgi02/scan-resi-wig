// src/app/api/warehouse/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/services/sessionService';
import { getErrorMessage } from '@/lib/utils';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        const history = await SessionService.getRecentActivity(limit);
        return NextResponse.json(history);
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 }
        );
    }
}
