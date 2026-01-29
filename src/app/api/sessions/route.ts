// src/app/api/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '@/services/sessionService';
import { getErrorMessage, getClientIP } from '@/lib/utils';
import { getSession, logActivity } from '@/lib/auth';

export async function GET() {
    try {
        const sessions = await SessionService.listSessions();
        return NextResponse.json(sessions);
    } catch (error: unknown) {
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const file = formData.get('file') as File;

        if (!name || !file) {
            return NextResponse.json(
                { error: 'Name and file are required' },
                { status: 400 }
            );
        }

        const sessionData = await getSession();
        if (!sessionData) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const session = await SessionService.createSession(name, buffer, sessionData.userId);

        // Log activities
        const ipAddress = getClientIP(req.headers);
        await logActivity({
            userId: sessionData.userId,
            action: 'CREATE_SESSION',
            details: { sessionId: session.id, sessionName: session.name },
            ipAddress
        });

        await logActivity({
            userId: sessionData.userId,
            action: 'UPLOAD_EXCEL',
            details: { sessionId: session.id, fileName: file.name, itemCount: session._count.items },
            ipAddress
        });

        return NextResponse.json(session);
    } catch (error: unknown) {
        console.error('Session Creation Error:', error);
        return NextResponse.json(
            { error: getErrorMessage(error) },
            { status: 500 }
        );
    }
}
